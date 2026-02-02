// Stripe Payment Integration
const API_URL = "/api";

// Configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SuaMhKGkUSoeBnp9N69d5kkpfTotJ6WzSvA45RSOj6n8PIFkAMbaeneT6ePsxzfwRlgkDh9TEF6vX9d9iLADdFL00VhBe7w1m';
// Check if Stripe is configured
if (STRIPE_PUBLISHABLE_KEY === 'pk_test_your_stripe_publishable_key_here') {
  document.addEventListener('DOMContentLoaded', () => {
    showMessage('Payment system is not configured. Please contact support.', 'error');
    document.getElementById('payBtn').disabled = true;
    document.getElementById('payBtn').textContent = 'Payment Unavailable';
  });
}

let selectedPaymentMethod = 'stripe';
let courseData = {
  id: null,
  name: "Web Development Bootcamp",
  price: 20000, // NPR (in paisa for Stripe)
  instructor: "Dr. Sharma",
  type: "regular"
};

let stripe;
let elements;
let paymentElement;

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('ocms_token');
  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }

  // Initialize Stripe
  stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  elements = stripe.elements();

  // Get course info from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const courseIdFromUrl = urlParams.get('courseId');
  const courseNameFromUrl = urlParams.get('courseName');
  const coursePriceFromUrl = urlParams.get('price');
  const courseType = urlParams.get('type') || 'regular';
  const returnUrl = urlParams.get('returnUrl');

  // Validate and fetch course details from database
  if (!courseIdFromUrl) {
    showMessage('Invalid course ID. Please go back and try again.', 'error');
    return;
  }

  try {
    const courseResponse = await fetch(`${API_URL}/courses/${courseIdFromUrl}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!courseResponse.ok) {
      if (courseResponse.status === 404) {
        showMessage('Course not found. It may have been deleted or unpublished.', 'error');
        return;
      }
      throw new Error(`Failed to fetch course: ${courseResponse.status}`);
    }

    const courseDetails = await courseResponse.json();
    
    // Validate course has a price
    if (!courseDetails.price || courseDetails.price <= 0) {
      showMessage('This course is not available for purchase or has no price set.', 'error');
      return;
    }
    
    // Use database data as the source of truth
    courseData.id = courseDetails.id;
    courseData.name = courseDetails.title;
    courseData.price = Math.round(parseFloat(courseDetails.price) * 100); // Convert to paisa
    
    // Update UI with correct course information
    document.getElementById('courseName').textContent = courseDetails.title;
    document.getElementById('coursePrice').textContent = `NPR ${parseFloat(courseDetails.price).toLocaleString()}`;
    document.getElementById('amount').value = courseDetails.price;

    // Store Zoom link if available
    if (courseDetails.zoom_link) {
      localStorage.setItem('payment_return_url', courseDetails.zoom_link);
    } else if (returnUrl) {
      localStorage.setItem('payment_return_url', returnUrl);
    }

  } catch (error) {
    console.error('Error loading course details:', error);
    showMessage('Failed to load course information. Please try again.', 'error');
    return;
  }

  initializePaymentForm();
});

// Initialize Payment Form
function initializePaymentForm() {
  const form = document.getElementById('paymentForm');
  const payBtn = document.getElementById('payBtn');

  // Ensure pay button starts disabled
  payBtn.disabled = true;
  payBtn.textContent = 'Initializing Payment...';

  // Create payment element container
  const paymentElementContainer = document.createElement('div');
  paymentElementContainer.id = 'payment-element';
  paymentElementContainer.style.marginBottom = '20px';

  // Insert before the pay button
  payBtn.parentNode.insertBefore(paymentElementContainer, payBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Double-check payment intent is initialized
    if (!window.paymentIntentData) {
      showMessage('Payment system is still initializing. Please wait...', 'error');
      return;
    }

    const amount = parseFloat(document.getElementById('amount').value);

    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';

    await initiateStripePayment(amount);
  });

  // Initialize Stripe Elements after form setup
  initializeStripeElements();
}

async function initializeStripeElements() {
  const payBtn = document.getElementById('payBtn');

  try {
    console.log('Initializing Stripe payment elements...');

    // Create payment intent first
    const response = await fetch(`${API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ocms_token')}`
      },
      body: JSON.stringify({
        course_id: courseData.id,
        amount: courseData.price / 100 // Convert from paisa back to NPR for API
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to create payment intent (${response.status})`);
    }

    console.log('Payment intent created successfully:', data);

    // Store payment intent details
    window.paymentIntentData = data;

    // Create payment element with the client secret
    const options = {
      clientSecret: data.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#22c55e',
        },
      },
    };

    // Update the global elements instance with client secret
    elements = stripe.elements(options);
    paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    console.log('Stripe elements mounted successfully');

    // Enable pay button
    payBtn.disabled = false;
    payBtn.textContent = 'Complete Payment';

    showMessage('Payment system ready. Enter your card details below.', 'success');

  } catch (error) {
    console.error('Stripe initialization error:', error);
    showMessage(`Failed to initialize payment: ${error.message}. Please refresh the page and try again.`, 'error');
    payBtn.disabled = true;
    payBtn.textContent = 'Payment Unavailable';
  }
}

// Stripe Payment Processing
async function initiateStripePayment(amount) {
  try {
    if (!window.paymentIntentData) {
      throw new Error('Payment system not initialized. Please refresh the page.');
    }

    if (!elements) {
      throw new Error('Payment elements not initialized. Please refresh the page.');
    }

    console.log('Confirming payment with Stripe...');

    const { error } = await stripe.confirmPayment({
      elements: elements,
      confirmParams: {
        return_url: `${window.location.origin}/student/payment-success.html?payment_intent=${window.paymentIntentData.clientSecret.split('_secret_')[0]}&payment_id=${window.paymentIntentData.payment_id}`,
      },
    });

    if (error) {
      console.error('Stripe payment error:', error);
      throw error;
    }

    console.log('Payment confirmed, redirecting to success page...');

    // Payment succeeded - redirect to success page
    window.location.href = `${window.location.origin}/student/payment-success.html?payment_intent=${window.paymentIntentData.clientSecret.split('_secret_')[0]}&payment_id=${window.paymentIntentData.payment_id}`;

  } catch (error) {
    console.error('Payment error:', error);
    showMessage(error.message || 'Payment failed. Please try again.', 'error');
    resetPayButton();
  }
}

// Show Message
function showMessage(message, type) {
  const messageEl = document.getElementById('paymentMessage');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
}

// Reset Pay Button
function resetPayButton() {
  const payBtn = document.getElementById('payBtn');
  payBtn.disabled = false;
  payBtn.textContent = 'Complete Payment';
}

// Handle payment failure from URL
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment_failed') === 'true') {
    showMessage('Payment was cancelled or failed. Please try again.', 'error');
  }
});

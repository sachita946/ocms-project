// eSewa Payment Integration
const API_URL = "/api";

let selectedPaymentMethod = 'esewa';
let courseData = {
  id: null,
  name: "Web Development Bootcamp",
  price: 20000, // NPR
  instructor: "Dr. Sharma",
  type: "regular"
};

let esewaPaymentData = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Get course info from URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const courseIdFromUrl = urlParams.get('courseId');
  const courseNameFromUrl = urlParams.get('courseName');
  const coursePriceFromUrl = urlParams.get('price');
  
  const token = localStorage.getItem('ocms_token');
  console.log('Payment page - Token check:', !!token);
  console.log('Payment page - Course params:', { courseIdFromUrl, courseNameFromUrl, coursePriceFromUrl });
  
  if (!token) {
    // No token - redirect to login with enrollment parameters
    const loginUrl = `/auth/login.html?enrollCourse=${courseIdFromUrl}&courseName=${encodeURIComponent(courseNameFromUrl)}&price=${coursePriceFromUrl}`;
    console.log('No token, redirecting to login:', loginUrl);
    window.location.href = loginUrl;
    return;
  }
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
      if (courseResponse.status === 401 || courseResponse.status === 403) {
        // Token invalid or expired, redirect to login
        localStorage.removeItem('ocms_token');
        window.location.href = '../auth/login.html';
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
    courseData.price = parseFloat(courseDetails.price); // Store as NPR
    
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Double-check payment intent is initialized
    if (!esewaPaymentData) {
      showMessage('Payment system is still initializing. Please wait...', 'error');
      return;
    }

    const amount = parseFloat(document.getElementById('amount').value);

    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';

    await initiateEsewaPayment(amount);
  });

  // Initialize eSewa payment
  initializeEsewaPayment();
}

async function initializeEsewaPayment() {
  const payBtn = document.getElementById('payBtn');
  const paymentInfo = document.getElementById('payment-info');

  try {
    console.log('Initializing eSewa payment...');

    // Show payment info
    if (paymentInfo) {
      paymentInfo.style.display = 'block';
    }

    // Create payment intent first
    const response = await fetch(`${API_URL}/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('ocms_token')}`
      },
      body: JSON.stringify({
        course_id: courseData.id,
        amount: courseData.price // Send NPR amount
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to create payment intent (${response.status})`);
    }

    console.log('eSewa payment initialized successfully:', data);

    // Store eSewa payment details
    esewaPaymentData = data;

    // Enable pay button
    payBtn.disabled = false;
    payBtn.textContent = 'Pay with eSewa';

    showMessage('Payment system ready. Click the button to proceed with eSewa payment.', 'success');

  } catch (error) {
    console.error('eSewa initialization error:', error);
    showMessage(`Failed to initialize payment: ${error.message}. Please refresh the page and try again.`, 'error');
    payBtn.disabled = true;
    payBtn.textContent = 'Payment Unavailable';
  }
}

// eSewa Payment Processing
async function initiateEsewaPayment(amount) {
  try {
    if (!esewaPaymentData) {
      throw new Error('Payment system not initialized. Please refresh the page.');
    }

    console.log('Redirecting to eSewa...');

    // Create a form and submit it to eSewa
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = esewaPaymentData.esewa_payment_url;

    // Add all eSewa parameters as hidden fields
    for (const [key, value] of Object.entries(esewaPaymentData.esewa_params)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }

    // Add form to page and submit
    document.body.appendChild(form);
    form.submit();

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

// Payment Integration with Khalti and eSewa
const API_URL = "/api";

// Configuration
const KHALTI_PUBLIC_KEY = "test_public_key_dc74e0fd57cb46cd93832aee0a390234"; // Replace with your Khalti test/live key
const ESEWA_MERCHANT_ID = "EPAYTEST"; // Replace with your eSewa merchant ID

let selectedPaymentMethod = null;
let courseData = {
  id: null,
  name: "Web Development Bootcamp",
  price: 15000, // NPR
  instructor: "Dr. Sharma"
};

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }

  // Get course info from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  courseData.id = urlParams.get('courseId') || '1';
  const courseName = urlParams.get('courseName');
  const coursePrice = urlParams.get('price');
  const courseType = urlParams.get('type') || 'regular';
  const selectedPaymentMethod = urlParams.get('paymentMethod') || 'esewa';

  if (courseName) document.getElementById('courseName').textContent = courseName;
  if (coursePrice) {
    courseData.price = parseInt(coursePrice);
    document.getElementById('coursePrice').textContent = `NPR ${parseInt(coursePrice).toLocaleString()}`;
    document.getElementById('amount').value = coursePrice;
  }

  initializePaymentMethods(selectedPaymentMethod);
  initializePaymentForm();
});

// Initialize Payment Method Selection
function initializePaymentMethods(defaultMethod = 'esewa') {
  const methodButtons = document.querySelectorAll('.payment-method-btn');
  
  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      methodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPaymentMethod = btn.dataset.method;
    });
  });

  // Set default to specified method or Khalti
  const defaultBtn = document.querySelector(`[data-method="${defaultMethod}"]`) || methodButtons[0];
  if (defaultBtn) {
    defaultBtn.click();
  }
}

// Initialize Payment Form
function initializePaymentForm() {
  const form = document.getElementById('paymentForm');
  const payBtn = document.getElementById('payBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedPaymentMethod) {
      showMessage('Please select a payment method', 'error');
      return;
    }

    const phoneNumber = document.getElementById('phoneNumber').value;
    const amount = parseInt(document.getElementById('amount').value);

    if (!phoneNumber) {
      showMessage('Please enter your phone/email', 'error');
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';

    if (selectedPaymentMethod === 'khalti') {
      initiateKhaltiPayment(amount, phoneNumber);
    } else if (selectedPaymentMethod === 'esewa') {
      initiateEsewaPayment(amount);
    }
  });
}

// Khalti Payment Integration
function initiateKhaltiPayment(amount, phoneNumber) {
  const config = {
    publicKey: KHALTI_PUBLIC_KEY,
    productIdentity: courseData.id,
    productName: courseData.name,
    productUrl: window.location.href,
    eventHandler: {
      onSuccess(payload) {
        console.log('Khalti Payment Success:', payload);
        verifyKhaltiPayment(payload);
      },
      onError(error) {
        console.error('Khalti Payment Error:', error);
        showMessage('Payment failed. Please try again.', 'error');
        resetPayButton();
      },
      onClose() {
        console.log('Khalti widget closed');
        resetPayButton();
      }
    },
    paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
  };

  const checkout = new KhaltiCheckout(config);
  checkout.show({ amount: amount * 100 }); // Khalti expects amount in paisa (1 NPR = 100 paisa)
}

// Verify Khalti Payment
async function verifyKhaltiPayment(payload) {
  try {
    const token = localStorage.getItem('token');
    
    // First verify with Khalti server
    const verifyResponse = await fetch('https://khalti.com/api/v2/payment/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${KHALTI_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: payload.token,
        amount: payload.amount
      })
    });

    const verifyData = await verifyResponse.json();
    
    if (verifyData.idx) {
      // Payment verified, save to our database
      const saveResponse = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: courseData.id,
          amount: payload.amount / 100, // Convert back to NPR
          payment_method: 'KHALTI',
          transaction_id: payload.idx,
          status: 'COMPLETED'
        })
      });

      const saveData = await saveResponse.json();

      if (saveResponse.ok) {
        // Create enrollment record for advanced courses
        const urlParams = new URLSearchParams(window.location.search);
        const courseType = urlParams.get('type');
        
        if (courseType === 'advanced') {
          try {
            const enrollResponse = await fetch(`${API_URL}/enrollments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                course_id: courseData.id
              })
            });
            
            if (enrollResponse.ok) {
              console.log('Successfully enrolled in advanced course');
            } else {
              console.error('Failed to enroll in course');
            }
          } catch (enrollError) {
            console.error('Enrollment error:', enrollError);
          }
        }
        
        showMessage('Payment successful! Redirecting to your courses...', 'success');
        setTimeout(() => {
          window.location.href = 'courses.html?enrolled=true';
        }, 2000);
      } else {
        showMessage(saveData.message || 'Failed to save payment', 'error');
        resetPayButton();
      }
    } else {
      showMessage('Payment verification failed', 'error');
      resetPayButton();
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    showMessage('Payment verification failed. Please contact support.', 'error');
    resetPayButton();
  }
}

// eSewa Payment Integration
function initiateEsewaPayment(amount) {
  const token = localStorage.getItem('token');
  const transactionId = `EDUVERSE-${Date.now()}-${courseData.id}`;
  
  // eSewa payment parameters
  const path = "https://uat.esewa.com.np/epay/main"; // Test URL
  // For live: https://esewa.com.np/epay/main
  
  const params = {
    amt: amount,
    psc: 0, // Service charge
    pdc: 0, // Delivery charge
    txAmt: 0, // Tax amount
    tAmt: amount, // Total amount
    pid: transactionId,
    scd: ESEWA_MERCHANT_ID,
    su: `${window.location.origin}/student/payment-success.html?method=esewa&courseId=${courseData.id}&amount=${amount}&txId=${transactionId}&type=${courseType}`,
    fu: `${window.location.origin}/student/payment.html?failed=true`
  };

  // Create and submit form
  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', path);

  for (const key in params) {
    const hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }

  document.body.appendChild(form);
  form.submit();
}

// Show Message
function showMessage(message, type) {
  const messageEl = document.getElementById('paymentMessage');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.classList.remove('hidden');
}

// Reset Pay Button
function resetPayButton() {
  const payBtn = document.getElementById('payBtn');
  payBtn.disabled = false;
  payBtn.textContent = 'Proceed to Payment';
}

// Handle payment failure from URL
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('failed') === 'true') {
    showMessage('Payment was cancelled or failed. Please try again.', 'error');
  }
});

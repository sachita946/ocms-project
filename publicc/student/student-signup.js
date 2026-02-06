import { authService } from '../js/api-service.js';

// Constants
const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully! Redirecting...'
};

const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'An internal server error occurred.',
  NETWORK_ERROR: 'Cannot connect to server. Please check your connection.'
};

  // Form elements
  const form = document.getElementById('studentForm');
  const studentName = document.getElementById('studentName');
  const studentEmail = document.getElementById('studentEmail');
  const studentPassword = document.getElementById('studentPassword');
  const studentConfirmPassword = document.getElementById('studentConfirmPassword');
  const studentPhone = document.getElementById('studentPhone');
  const studentEducation = document.getElementById('studentEducation');
  const studentSkills = document.getElementById('studentSkills');
  const studentBio = document.getElementById('studentBio');

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) {
    input.classList.add("error-input");
    input.classList.remove("success-input");
  }

  if (error) {
    error.textContent = message;
    error.style.opacity = "1";
  }
}

function showSuccess(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) {
    input.classList.remove("error-input");
    input.classList.add("success-input");
  }

  if (error) {
    error.textContent = "";
    error.style.opacity = "0";
  }
}

// Global message display functions
function showSuccessMessage(message) {
  const msgDiv = document.getElementById('signupMessage') || createMessageDiv();
  msgDiv.textContent = message;
  msgDiv.className = 'message success-message';
  msgDiv.style.display = 'block';
}

function showErrorMessage(message) {
  const msgDiv = document.getElementById('signupMessage') || createMessageDiv();
  msgDiv.textContent = message;
  msgDiv.className = 'message error-message';
  msgDiv.style.display = 'block';
}

function createMessageDiv() {
  const msgDiv = document.createElement('div');
  msgDiv.id = 'signupMessage';
  msgDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 1000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(msgDiv);
  return msgDiv;
}

function clearAllErrors() {
  // Clear all error messages
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => el.textContent = '');

  // Reset input styles
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.classList.remove('error-input');
    input.classList.remove('success-input');
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let valid = true;

  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const password = studentPassword.value.trim();
  const confirm = studentConfirmPassword.value.trim();

  // Full Name Validation
  if (!name) {
    valid = false;
    showError("studentName", "errName", "Full name is required.");
  } else if (name.length < 2) {
    valid = false;
    showError("studentName", "errName", "Full name must be at least 2 characters.");
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    valid = false;
    showError("studentName", "errName", "Full name can only contain letters and spaces.");
  } else {
    showSuccess("studentName", "errName");
  }

  // Email Validation
  if (!email) {
    valid = false;
    showError("studentEmail", "errEmail", "Email is required.");
  } else if (/^\d/.test(email)) {
    valid = false;
    showError("studentEmail", "errEmail", "Email cannot start with a number.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    valid = false;
    showError("studentEmail", "errEmail", "Please enter a valid email address.");
  } else {
    showSuccess("studentEmail", "errEmail");
  }

  // Password Validation
  if (!password) {
    valid = false;
    showError("studentPassword", "errPassword", "Password is required.");
  } else if (password.length < 10) {
    valid = false;
    showError("studentPassword", "errPassword", "Password must be at least 10 characters long.");
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    valid = false;
    showError("studentPassword", "errPassword", "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
  } else {
    showSuccess("studentPassword", "errPassword");
  }

  if (password !== confirm) {
    valid = false;
    showError("studentConfirmPassword", "errConfirmPassword", "Passwords do not match.");
  } else {
    showSuccess("studentConfirmPassword", "errConfirmPassword");
  }

  if (!valid) return;

  // Submit to backend
  const nameParts = name.trim().split(' ');
  const payload = {
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    email,
    password,
    role: 'STUDENT',
    phone: studentPhone.value || undefined,
    bio: studentBio.value || undefined,
    current_education_level: studentEducation.value || undefined,
    interests: studentSkills.value ? studentSkills.value.split(',').map(s => s.trim()) : undefined,
  };

  // Remove undefined values
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  try {
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    // Clear previous errors
    clearAllErrors();

    // Use the auth service
    const data = await authService.signup(payload);

    // Show success message
    showSuccessMessage(SUCCESS_MESSAGES.SIGNUP_SUCCESS);

    // Check for enrollment parameters
    const urlParams = new URLSearchParams(window.location.search);
    const enroll = urlParams.get('enroll');
    const courseId = urlParams.get('courseId');
    const courseName = urlParams.get('courseName');
    const price = urlParams.get('price');

    if (enroll === 'true' && courseId) {
      // User was trying to enroll - redirect to payment after brief delay
      setTimeout(() => {
        if (price && parseFloat(price) > 0) {
          // Paid course - redirect to payment
          window.location.href = `payment.html?courseId=${courseId}&courseName=${encodeURIComponent(courseName || '')}&price=${price}`;
        } else {
          // Free course - redirect to courses page (will auto-enroll)
          window.location.href = `courses.html?enroll=${courseId}`;
        }
      }, 1500);
    } else {
      // Regular signup - redirect to login
      setTimeout(() => {
        window.location.href = window.location.origin + '/auth/login.html';
      }, 1500);
    }

  } catch (error) {
    // Show inline error message
    showErrorMessage(error.message || ERROR_MESSAGES.INTERNAL_ERROR);

    // Re-enable button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});
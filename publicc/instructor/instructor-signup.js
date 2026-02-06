import { authService } from '../js/api-service.js';

// Constants
const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Instructor account created successfully! Redirecting to login...'
};

const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'An internal server error occurred.',
  NETWORK_ERROR: 'Cannot connect to server. Please check your connection.'
};

// Form elements
const form = document.getElementById('instructorForm');
const instructorName = document.getElementById('instructorName');
const instructorLastName = document.getElementById('instructorLastName');
const instructorEmail = document.getElementById('instructorEmail');
const instructorPassword = document.getElementById('instructorPassword');
const instructorConfirmPassword = document.getElementById('instructorConfirmPassword');
const instructorPhone = document.getElementById('instructorPhone');
const instructorBio = document.getElementById('instructorBio');
const instructorExperience = document.getElementById('instructorExperience');
const instructorSubjects = document.getElementById('instructorSubjects');
const instructorEducation = document.getElementById('instructorEducation');
const instructorWebsite = document.getElementById('instructorWebsite');

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
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.classList.remove('error-input');
    input.classList.remove('success-input');
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let valid = true;

  const firstName = instructorName.value.trim();
  const lastName = instructorLastName.value.trim();
  const email = instructorEmail.value.trim();
  const password = instructorPassword.value.trim();
  const confirmPassword = instructorConfirmPassword.value.trim();

  // First Name Validation
  if (!firstName) {
    valid = false;
    showError("instructorName", "errName", "First name is required.");
  } else if (firstName.length < 2) {
    valid = false;
    showError("instructorName", "errName", "First name must be at least 2 characters.");
  } else if (!/^[a-zA-Z\s]+$/.test(firstName)) {
    valid = false;
    showError("instructorName", "errName", "First name can only contain letters and spaces.");
  } else {
    showSuccess("instructorName", "errName");
  }

  // Last Name Validation
  if (!lastName) {
    valid = false;
    showError("instructorLastName", "errLastName", "Last name is required.");
  } else if (lastName.length < 2) {
    valid = false;
    showError("instructorLastName", "errLastName", "Last name must be at least 2 characters.");
  } else if (!/^[a-zA-Z\s]+$/.test(lastName)) {
    valid = false;
    showError("instructorLastName", "errLastName", "Last name can only contain letters and spaces.");
  } else {
    showSuccess("instructorLastName", "errLastName");
  }

  // Email Validation
  if (!email) {
    valid = false;
    showError("instructorEmail", "errEmail", "Email is required.");
  } else if (/^\d/.test(email)) {
    valid = false;
    showError("instructorEmail", "errEmail", "Email cannot start with a number.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    valid = false;
    showError("instructorEmail", "errEmail", "Please enter a valid email address.");
  } else {
    showSuccess("instructorEmail", "errEmail");
  }

  // Password Validation
  if (!password) {
    valid = false;
    showError("instructorPassword", "errPassword", "Password is required.");
  } else if (password.length < 10) {
    valid = false;
    showError("instructorPassword", "errPassword", "Password must be at least 10 characters long.");
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    valid = false;
    showError("instructorPassword", "errPassword", "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
  } else {
    showSuccess("instructorPassword", "errPassword");
  }

  // Confirm Password Validation
  if (password !== confirmPassword) {
    valid = false;
    showError("instructorConfirmPassword", "errConfirmPassword", "Passwords do not match.");
  } else {
    showSuccess("instructorConfirmPassword", "errConfirmPassword");
  }

  if (!valid) return;

  // Prepare payload
  const payload = {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    role: 'INSTRUCTOR',
    phone: instructorPhone.value || undefined,
    bio: instructorBio.value || undefined,
    experience_years: instructorExperience.value ? parseInt(instructorExperience.value) : undefined,
    expertise_area: instructorSubjects.value || undefined,
    qualifications: instructorEducation.value || undefined,
    website: instructorWebsite.value || undefined
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
    console.log('Sending signup request with payload:', payload);
    const data = await authService.signup(payload);
    console.log('Signup response:', data);

    // Show success message
    showSuccessMessage(SUCCESS_MESSAGES.SIGNUP_SUCCESS);

    // Redirect to login page for manual login
    setTimeout(() => {
      window.location.href = window.location.origin + '/auth/login.html';
    }, 1500);

  } catch (error) {
    // Show inline error message
    showErrorMessage(error.message || ERROR_MESSAGES.INTERNAL_ERROR);

    // Re-enable button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

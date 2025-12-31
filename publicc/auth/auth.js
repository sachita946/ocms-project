const BASE_URL = '/api';

// ===== Utility Functions =====
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.add('show');
  }
}

function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = '';
    el.classList.remove('show');
  }
}

function showSuccess(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.add('show');
  }
}

function clearSuccess(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = '';
    el.classList.remove('show');
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidName(name) {
  return /^.{2,60}$/.test(String(name).trim());
}

// ===== Tab Switching =====
document.querySelectorAll('.form-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    switchTab(tabName);
  });
});

document.querySelectorAll('.switch-tab').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabName = link.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Hide all forms
  document.querySelectorAll('.form-section').forEach(form => {
    form.classList.remove('active');
  });
  document.querySelectorAll('.form-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show selected form
  document.getElementById(tabName + 'Form').classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Clear errors
  document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
}

// ===== Role Toggle (Show/Hide Instructor Fields) =====
document.querySelectorAll('input[name="role"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const instructorFields = document.getElementById('instructorFields');
    if (radio.value === 'INSTRUCTOR' && radio.checked) {
      instructorFields.classList.add('show');
    } else {
      instructorFields.classList.remove('show');
    }
  });
});

// ===== LOGIN HANDLER =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  // Clear previous errors
  clearError('loginEmailErr');
  clearError('loginPasswordErr');
  clearError('loginServerErr');
  clearSuccess('loginSuccessMsg');

  // Validation
  if (!isValidEmail(email)) {
    return showError('loginEmailErr', 'Please enter a valid email');
  }
  if (!password) {
    return showError('loginPasswordErr', 'Password is required');
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const body = await res.json();

    if (res.ok && body.token) {
      // Store token and user role
      localStorage.setItem('ocms_token', body.token);
      localStorage.setItem('ocms_user_role', body.user.role);
      localStorage.setItem('ocms_user', JSON.stringify(body.user));

      showSuccess('loginSuccessMsg', 'Login successful! Redirecting...');
      
      // Redirect based on role
      setTimeout(() => {
        if (body.user.role === 'INSTRUCTOR') {
          location.href = '/dashboard/instructor/index.html';
        } else {
          location.href = '/dashboard/student/index.html';
        }
      }, 1500);
    } else {
      showError('loginServerErr', body.message || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    showError('loginServerErr', 'Network error. Please try again.');
  }
});

// ===== SIGNUP HANDLER =====
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const bio = document.getElementById('instructorBio')?.value.trim();
  const expertise = document.getElementById('instructorExpertise')?.value.trim();
  const website = document.getElementById('instructorWebsite')?.value.trim();

  // Clear errors
  ['firstNameErr', 'lastNameErr', 'signupEmailErr', 'signupPasswordErr', 
   'bioErr', 'expertiseErr', 'signupServerErr'].forEach(id => clearError(id));
  clearSuccess('signupSuccessMsg');

  // Validation
  let hasError = false;

  if (!isValidName(firstName)) {
    showError('firstNameErr', 'First name must be 2-60 characters');
    hasError = true;
  }
  if (!isValidName(lastName)) {
    showError('lastNameErr', 'Last name must be 2-60 characters');
    hasError = true;
  }
  if (!isValidEmail(email)) {
    showError('signupEmailErr', 'Please enter a valid email');
    hasError = true;
  }
  if (!password || password.length < 6) {
    showError('signupPasswordErr', 'Password must be at least 6 characters');
    hasError = true;
  }
  if (role === 'INSTRUCTOR' && !bio) {
    showError('bioErr', 'Bio is required for instructors');
    hasError = true;
  }
  if (role === 'INSTRUCTOR' && !expertise) {
    showError('expertiseErr', 'Expertise area is required for instructors');
    hasError = true;
  }

  if (hasError) return;

  try {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        ...(role === 'INSTRUCTOR' && { bio, expertise, website })
      })
    });

    const body = await res.json();

    if (res.ok && body.token) {
      // Store token and user role
      localStorage.setItem('ocms_token', body.token);
      localStorage.setItem('ocms_user_role', body.user.role);
      localStorage.setItem('ocms_user', JSON.stringify(body.user));

      showSuccess('signupSuccessMsg', 'Account created! Redirecting to dashboard...');
      
      // Redirect based on role
      setTimeout(() => {
        if (body.user.role === 'INSTRUCTOR') {
          location.href = '/dashboard/instructor/index.html';
        } else {
          location.href = '/dashboard/student/index.html';
        }
      }, 1500);
    } else {
      showError('signupServerErr', body.message || 'Sign up failed');
    }
  } catch (err) {
    console.error(err);
    showError('signupServerErr', 'Network error. Please try again.');
  }
});

// ===== FORGOT PASSWORD HANDLER =====
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('forgotEmail').value.trim().toLowerCase();

  clearError('forgotEmailErr');
  clearError('forgotServerErr');
  clearSuccess('forgotSuccessMsg');

  if (!isValidEmail(email)) {
    return showError('forgotEmailErr', 'Please enter a valid email');
  }

  try {
    const res = await fetch(`${BASE_URL}/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const body = await res.json();

    if (res.ok) {
      showSuccess('forgotSuccessMsg', 'Reset link sent to your email!');
      // In production, you'd get a reset link via email
      // For demo, show the token
      if (body.resetToken) {
        console.log('Reset Token (dev only):', body.resetToken);
      }
    } else {
      showError('forgotServerErr', body.message || 'Failed to send reset link');
    }
  } catch (err) {
    console.error(err);
    showError('forgotServerErr', 'Network error. Please try again.');
  }
});

// ===== Check if already logged in =====
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('ocms_token');
  const role = localStorage.getItem('ocms_user_role');
  
  if (token && role) {
    if (role === 'INSTRUCTOR') {
      location.href = '/dashboard/instructor-dashboard.html';
    } else {
      location.href = '/dashboard/student-dashboard.html';
    }
  }
});
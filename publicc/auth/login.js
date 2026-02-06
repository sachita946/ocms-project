/* auth.client.js
   Put this in publicc/js/ or public/js/ and include in login/signup pages.
   Handles: login, signup, forgot, reset, social redirects, token handling, and page guard.
*/

// Resolve backend API base to avoid 405 when page is served from a different origin (e.g., Live Server)
const BACKEND_ORIGIN = (window.OCMS_API_ORIGIN)
  || 'http://localhost:3000';
const API_URL = `${BACKEND_ORIGIN}/api`;
const qs = id => document.getElementById(id);
const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').toLowerCase());
const isNameValid = n => /^.{2,60}$/.test(String(n||'').trim());

// Helper: show/hide
function show(el){ if (!el) return; el.style.display = ''; }
function hide(el){ if (!el) return; el.style.display = 'none'; }
function setText(id, text = '') { const el = qs(id); if (el) el.textContent = text; }

// Inline message functions
function showInlineMessage(message, type = 'info') {
  let messageContainer = qs('inlineMessage');
  
  // Create inline message container if it doesn't exist
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'inlineMessage';
    messageContainer.className = 'inline-message';
    messageContainer.innerHTML = `
      <div class="message-content">
        <span id="messageText"></span>
        <button class="close-message" onclick="hideInlineMessage()">&times;</button>
      </div>
    `;
    document.body.appendChild(messageContainer);
    
    // Add styles if not present
    if (!document.getElementById('inlineMessageStyles')) {
      const style = document.createElement('style');
      style.id = 'inlineMessageStyles';
      style.textContent = `
        .inline-message {
          display: none;
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          max-width: 400px;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: slideInRight 0.3s ease-out;
          font-weight: 500;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .inline-message.success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border-left: 4px solid #10b981;
        }
        .inline-message.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
          border-left: 4px solid #ef4444;
        }
        .inline-message.info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          border-left: 4px solid #3b82f6;
        }
        .inline-message .close-message {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        .inline-message .close-message:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  const messageText = qs('messageText');
  if (messageText) messageText.textContent = message;
  messageContainer.className = `inline-message ${type}`;
  messageContainer.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideInlineMessage();
  }, 5000);
}

function hideInlineMessage() {
  const messageContainer = qs('inlineMessage');
  if (messageContainer) {
    messageContainer.style.display = 'none';
  }
}

// Confirmation dialog function
function showConfirmDialog(message, onConfirm, onCancel) {
  let confirmDialog = qs('confirmDialog');
  
  if (!confirmDialog) {
    confirmDialog = document.createElement('div');
    confirmDialog.id = 'confirmDialog';
    confirmDialog.className = 'confirm-dialog-overlay';
    confirmDialog.innerHTML = `
      <div class="confirm-dialog-content">
        <div class="confirm-dialog-header">
          <h3>Confirm Action</h3>
        </div>
        <div class="confirm-dialog-body">
          <p id="confirmMessage"></p>
        </div>
        <div class="confirm-dialog-footer">
          <button class="btn-confirm-cancel">Cancel</button>
          <button class="btn-confirm-yes">Yes, Continue</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmDialog);
    
    // Add styles
    if (!document.getElementById('confirmDialogStyles')) {
      const style = document.createElement('style');
      style.id = 'confirmDialogStyles';
      style.textContent = `
        .confirm-dialog-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          z-index: 10001;
          align-items: center;
          justify-content: center;
        }
        .confirm-dialog-content {
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          border-radius: 16px;
          max-width: 450px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: modalFadeIn 0.3s ease-out;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .confirm-dialog-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .confirm-dialog-header h3 {
          margin: 0;
          color: #fff;
          font-size: 20px;
          font-weight: 600;
        }
        .confirm-dialog-body {
          padding: 24px;
        }
        .confirm-dialog-body p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          font-size: 16px;
        }
        .confirm-dialog-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn-confirm-cancel,
        .btn-confirm-yes {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 14px;
        }
        .btn-confirm-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-confirm-cancel:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .btn-confirm-yes {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
        }
        .btn-confirm-yes:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  const messageEl = qs('confirmMessage');
  if (messageEl) messageEl.textContent = message;
  
  confirmDialog.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  const yesBtn = confirmDialog.querySelector('.btn-confirm-yes');
  const cancelBtn = confirmDialog.querySelector('.btn-confirm-cancel');
  
  const closeDialog = () => {
    confirmDialog.style.display = 'none';
    document.body.style.overflow = 'auto';
  };
  
  // Remove old listeners
  const newYesBtn = yesBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  yesBtn.replaceWith(newYesBtn);
  cancelBtn.replaceWith(newCancelBtn);
  
  newYesBtn.addEventListener('click', () => {
    closeDialog();
    if (onConfirm) onConfirm();
  });
  
  newCancelBtn.addEventListener('click', () => {
    closeDialog();
    if (onCancel) onCancel();
  });
}

// Decide dashboard path by role
function getDashboardPath(role) {
  if (role === 'INSTRUCTOR') return '/instructor/instructor-dashboard.html';
  if (role === 'ADMIN') return '/admin/dashboard.html';
  if (role === 'STUDENT') return '/student/student-dashboard.html';
  return '/student/courses.html';
}

// Save token and optionally redirect to dashboard
async function saveTokenAndRedirect(token, role) {
  try { localStorage.setItem('ocms_token', token); } catch (e) {}
  const targetRole = role || (await fetchRoleFromToken(token));
  
  // For instructors, check if they're verified
  if (targetRole === 'INSTRUCTOR') {
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json().catch(() => null);
      const instructorProfile = body?.user?.instructorProfile;
      if (instructorProfile && !instructorProfile.is_verified) {
        // Redirect to a pending approval page or show message
        window.location.href = '/auth/pending-approval.html';
        return;
      }
    } catch (error) {
      console.error('Failed to check instructor verification:', error);
    }
  }
  
  // Check for return URL or enrollment course in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const enrollCourse = urlParams.get('enrollCourse');
  const courseName = urlParams.get('courseName');
  const price = urlParams.get('price');
  const returnUrl = urlParams.get('returnUrl');
  const enrollParam = urlParams.get('enroll');
  const courseId = urlParams.get('courseId');
  const redirect = urlParams.get('redirect');

  console.log('Post-login redirect params:', { enrollCourse, courseName, price, returnUrl, redirect });

  if (redirect === 'payment' && courseId && targetRole === 'STUDENT') {
    // New flow: redirect to payment for advanced courses
    const paymentUrl = `/student/payment.html?courseId=${courseId}&courseName=${encodeURIComponent(courseName || '')}&price=${price || ''}`;
    console.log('Redirecting to payment after login:', paymentUrl);
    window.location.href = paymentUrl;
    return;
  } else if (enrollCourse && courseName && price && targetRole === 'STUDENT') {
    // Legacy: User logged in to enroll in a course - redirect to payment
    window.location.href = `/student/payment.html?courseId=${enrollCourse}&courseName=${encodeURIComponent(courseName)}&price=${price}`;
    return;
  } else if (returnUrl) {
    // If there's a return URL, use it
    let redirectUrl = decodeURIComponent(returnUrl);
    if (enrollCourse) {
      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set('enroll', enrollCourse);
      redirectUrl = url.toString();
    }
    window.location.href = redirectUrl;
    return;
  } else if (enrollParam === 'true' && courseId && targetRole === 'STUDENT') {
    // Handle enrollment redirect from courses page
    window.location.href = `/student/courses.html?enroll=${courseId}`;
    return;
  } else if (redirect === 'courses' && enrollParam && targetRole === 'STUDENT') {
    // Handle enrollment redirect from courses page with enroll parameter
    window.location.href = `/student/courses.html?enroll=${enrollParam}`;
    return;
  }
  
  window.location.href = getDashboardPath(targetRole);
}

async function fetchRoleFromToken(token) {
  try {
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json().catch(() => null);
    return body?.user?.role || body?.role;
  } catch (e) {
    return null;
  }
}

// requireLogin: to protect pages (use in protected pages)
export function requireLogin() {
  const token = localStorage.getItem('ocms_token');
  if (!token) window.location.href = '/auth/login.html';
}

// Parse OAuth token from query param ?token=...
function captureTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    try { localStorage.setItem('ocms_token', token); } catch (e) {}
    // remove token from URL
    params.delete('token');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    history.replaceState({}, '', newUrl);
    return fetchRoleFromToken(token).then((role) => {
      // Check for return URL or enrollment course in remaining params
      const enrollCourse = params.get('enrollCourse');
      const courseName = params.get('courseName');
      const price = params.get('price');
      const returnUrl = params.get('returnUrl');
      const enrollParam = params.get('enroll');
      const courseId = params.get('courseId');
      
      console.log('OAuth redirect params:', { enrollCourse, courseName, price, returnUrl });
      
      if (enrollCourse && courseName && price && role === 'STUDENT') {
        // User logged in via OAuth to enroll - redirect to payment
        window.location.href = `/student/payment.html?courseId=${enrollCourse}&courseName=${encodeURIComponent(courseName)}&price=${price}`;
        return;
      } else if (returnUrl) {
        let redirectUrl = decodeURIComponent(returnUrl);
        if (enrollCourse) {
          const url = new URL(redirectUrl, window.location.origin);
          url.searchParams.set('enroll', enrollCourse);
          redirectUrl = url.toString();
        }
        window.location.href = redirectUrl;
        return;
      } else if (enrollParam === 'true' && courseId && role === 'STUDENT') {
        // Handle enrollment redirect from courses page
        window.location.href = `/student/courses.html?enroll=${courseId}`;
        return;
      }
      
      window.location.href = getDashboardPath(role);
    });
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in and has enrollment parameters - redirect to payment
  const token = localStorage.getItem('ocms_token');
  const urlParams = new URLSearchParams(window.location.search);
  const enrollCourse = urlParams.get('enrollCourse');
  const courseName = urlParams.get('courseName');
  const price = urlParams.get('price');

  if (token && enrollCourse && courseName && price) {
    // User is already logged in and has enrollment params - redirect directly to payment
    console.log('User already logged in, redirecting to payment for enrollment');
    window.location.href = `/student/payment.html?courseId=${enrollCourse}&courseName=${encodeURIComponent(courseName)}&price=${price}`;
    return;
  }

  // Capture OAuth token if present
  captureTokenFromUrl();

  // Elements (may be missing on some pages; code guards exist)
  const loginForm = qs('loginForm');
  const signupForm = qs('signupForm');
  const forgotForm = qs('forgotForm');
  const resetForm = qs('resetForm');

  // Common: social buttons
  const socialGoogle = qs('socialGoogleBtn');
  const socialFacebook = qs('socialFacebookBtn');
  if (socialGoogle) socialGoogle.addEventListener('click', () => window.location.href = `${BACKEND_ORIGIN}/auth/google`);
  if (socialFacebook) socialFacebook.addEventListener('click', () => window.location.href = `${BACKEND_ORIGIN}/auth/facebook`);

  // Toggle UI functions (for embedded/signup card UI)
  const signupEmbedded = qs('signupEmbedded');
  const forgot = qs('forgot');
  const reset = qs('reset');

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t) return;
    if (t.id === 'showSignupLink' || t.closest && t.closest('#showSignupLink')) {
      e.preventDefault(); show(signupEmbedded); hide(forgot); hide(reset); qs('firstName')?.focus();
    }
    if (t.id === 'cancelSignup' || t.closest && t.closest('#cancelSignup')) {
      e.preventDefault(); hide(signupEmbedded);
    }
    if (t.id === 'showForgotBtn' || t.closest && t.closest('#showForgotBtn')) {
      e.preventDefault(); show(forgot); hide(signupEmbedded); hide(reset); qs('forgotEmail')?.focus();
    }
    if (t.id === 'cancelForgot' || t.closest && t.closest('#cancelForgot')) {
      e.preventDefault(); hide(forgot);
    }
    if (t.id === 'cancelReset' || t.closest && t.closest('#cancelReset')) {
      e.preventDefault(); hide(reset);
    }
  });

  // Role radio toggle for instructor fields
  const roleRadios = Array.from(document.querySelectorAll('input[name="role"]'));
  function updateRoleFields() {
    const instr = qs('instructorFields');
    const role = document.querySelector('input[name="role"]:checked')?.value;
    if (!instr) return;
    if (role === 'INSTRUCTOR') show(instr); else hide(instr);
  }
  roleRadios.forEach(r => r.addEventListener('change', updateRoleFields));
  updateRoleFields();

  /* ------------------ LOGIN ------------------ */
  if (loginForm) {
    console.log('Login form found, attaching event listener');
    loginForm.addEventListener('submit', async (e) => {
      console.log('Login form submitted');
      e.preventDefault();
      setText('loginEmailError'); setText('loginPasswordError'); setText('loginServerError');

      const email = qs('loginEmail').value.trim().toLowerCase();
      const password = qs('loginPassword').value;

      // Client-side validation
      if (!email) {
        setText('loginEmailError', 'Email is required');
        showInlineMessage('Please enter your email address', 'error');
        return;
      }
      if (!isValidEmail(email)) {
        setText('loginEmailError', 'Enter a valid email');
        showInlineMessage('Please enter a valid email address', 'error');
        return;
      }
      if (/^\d/.test(email)) {
        setText('loginEmailError', 'Email cannot start with a number');
        showInlineMessage('Email address cannot start with a number', 'error');
        return;
      }
      if (!password) {
        setText('loginPasswordError', 'Enter your password');
        showInlineMessage('Please enter your password', 'error');
        return;
      }

      // Show confirmation dialog
      // showConfirmDialog('Are you sure you want to login?', async () => {
        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
          console.log('Sending login request to:', `${API_URL}/auth/login`);
          console.log('Login payload:', { email, password });
          
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
          });
          
          console.log('Login response status:', res.status);
          const body = await res.json().catch(()=>null);
          console.log('Login response body:', body);
          
          // Re-enable button
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          
          if (res.ok && body?.token) {
            showInlineMessage('Login successful! Redirecting...', 'success');
            
            // Store auth data
            // localStorage.setItem('token', body.token);
            localStorage.setItem('ocms_token', body.token);
            localStorage.setItem('user', JSON.stringify(body.user || {}));
            localStorage.setItem('user_role', body.user?.role || body.role);
            
            // Debug logging
            console.log('Login response body:', body);
            console.log('User role from response:', body.user?.role || body.role);
            console.log('Stored user_role:', localStorage.getItem('user_role'));
            
            // Redirect based on role with verification check
            const role = body?.user?.role || body?.role;
            console.log('Login successful, role:', role);
            
            // Use saveTokenAndRedirect for proper verification handling
            await saveTokenAndRedirect(body.token, role);
            
            return;
          }
          
          // Handle login errors
          const errorMsg = (body && (body.message || body.error)) || 'Login failed';
          
          if (res.status === 401 || errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('incorrect')) {
            setText('loginServerError', 'Email or password is incorrect');
            showInlineMessage('Email or password is incorrect. Please try again.', 'error');
          } else if (res.status === 404 || errorMsg.toLowerCase().includes('not found')) {
            setText('loginServerError', 'Account not found');
            showInlineMessage('No account found with this email address.', 'error');
          } else {
            setText('loginServerError', errorMsg);
            showInlineMessage(errorMsg, 'error');
          }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          setText('loginServerError', 'Network error - please check your connection');
          showInlineMessage('Network error. Please check your connection and try again.', 'error');
          console.error('Login error:', err);
        }
      // }, () => {
      //   // Cancelled
      //   showInlineMessage('Login cancelled', 'info');
      // });
    });
  }

  /* ------------------ SIGNUP ------------------ */
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      ['firstNameError','lastNameError','signupEmailError','signupPasswordError','bioError','expertiseError','signupServerError'].forEach(id => setText(id,''));

      const first_name = qs('firstName').value.trim();
      const last_name = qs('lastName').value.trim();
      const email = qs('signupEmail').value.trim().toLowerCase();
      const password = qs('signupPassword').value;
      const role = document.querySelector('input[name="role"]:checked')?.value || 'STUDENT';
      const bio = qs('bio')?.value.trim();
      const expertise = qs('expertise')?.value.trim();

      let invalid = false;
      
      // First Name Validation
      if (!first_name) {
        setText('firstNameError','First name is required');
        invalid = true;
      } else if (first_name.length < 2) {
        setText('firstNameError','First name must be at least 2 characters');
        invalid = true;
      } else if (!/^[a-zA-Z\s]+$/.test(first_name)) {
        setText('firstNameError','First name can only contain letters and spaces');
        invalid = true;
      }
      
      // Last Name Validation
      if (!last_name) {
        setText('lastNameError','Last name is required');
        invalid = true;
      } else if (last_name.length < 2) {
        setText('lastNameError','Last name must be at least 2 characters');
        invalid = true;
      } else if (!/^[a-zA-Z\s]+$/.test(last_name)) {
        setText('lastNameError','Last name can only contain letters and spaces');
        invalid = true;
      }
      
      // Email Validation
      if (!email) {
        setText('signupEmailError','Email is required');
        invalid = true;
      } else if (/^\d/.test(email)) {
        setText('signupEmailError','Email cannot start with a number');
        invalid = true;
      } else if (!isValidEmail(email)) {
        setText('signupEmailError','Enter a valid email');
        invalid = true;
      }
      
      // Password Validation
      if (!password) {
        setText('signupPasswordError','Password is required');
        invalid = true;
      } else if (password.length < 10) {
        setText('signupPasswordError','Password must be at least 10 characters');
        invalid = true;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
        setText('signupPasswordError','Password must contain uppercase, lowercase, number, and special character');
        invalid = true;
      }
      
      if (role === 'INSTRUCTOR' && !bio) { 
        setText('bioError','Bio is required for instructors'); 
        invalid = true; 
      }
      if (invalid) return;

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ first_name, last_name, email, password, role, bio, expertise })
        });
        const body = await res.json().catch(()=>null);
        if (res.ok && body?.token) return saveTokenAndRedirect(body.token, body?.user?.role || role);
        // some backends return 201 created without token -> redirect to login
        if (res.status === 201 || res.status === 200) return window.location.href = '/auth/login.html';
        setText('signupServerError', (body && (body.message || body.error)) || 'Registration failed');
      } catch (err) {
        setText('signupServerError','Network error');
      }
    });
  }

  /* ------------------ FORGOT PASSWORD ------------------ */
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setText('forgotEmailError'); setText('forgotServerError'); setText('forgotSuccess','');

      const email = qs('forgotEmail').value.trim().toLowerCase();
      if (!isValidEmail(email)) return setText('forgotEmailError','Enter a valid email');

      try {
        const res = await fetch(`${API_URL}/password/forgot`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email })
        });
        const body = await res.json().catch(()=>null);
        if (res.ok) return setText('forgotSuccess', 'Reset link sent (check email).');
        setText('forgotServerError', (body && (body.message || body.error)) || 'Failed to send reset link');
      } catch (err) {
        setText('forgotServerError','Network error');
      }
    });
  }

  /* ------------------ RESET PASSWORD ------------------ */
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setText('resetTokenError'); setText('newPasswordError'); setText('resetServerError'); setText('resetSuccess','');

      const token = qs('resetToken').value.trim();
      const newPassword = qs('newPassword').value;
      if (!token) return setText('resetTokenError','Token required');
      if (!newPassword || newPassword.length < 6) return setText('newPasswordError','Password must be at least 6 characters');

      try {
        const res = await fetch(`${API_URL}/password/reset`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ token, password: newPassword })
        });
        const body = await res.json().catch(()=>null);
        if (res.ok) return setText('resetSuccess','Password reset successful. You can log in now.');
        setText('resetServerError', (body && (body.message || body.error)) || 'Reset failed');
      } catch (err) {
        setText('resetServerError','Network error');
      }
    });
  }

});
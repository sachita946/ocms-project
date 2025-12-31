/* auth.client.js
   Put this in publicc/js/ or public/js/ and include in login/signup pages.
   Handles: login, signup, forgot, reset, social redirects, token handling, and page guard.
*/

const qs = id => document.getElementById(id);
const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').toLowerCase());
const isNameValid = n => /^.{2,60}$/.test(String(n||'').trim());

// Helper: show/hide
function show(el){ if (!el) return; el.style.display = ''; }
function hide(el){ if (!el) return; el.style.display = 'none'; }
function setText(id, text = '') { const el = qs(id); if (el) el.textContent = text; }

// Decide dashboard path by role
function getDashboardPath(role) {
  if (role === 'INSTRUCTOR') return '/dashboards/instructor-dashboard.html';
  return '/dashboards/student-dashboard.html';
}

// Save token and optionally redirect to dashboard
async function saveTokenAndRedirect(token, role) {
  try { localStorage.setItem('ocms_token', token); } catch (e) {}
  const targetRole = role || (await fetchRoleFromToken(token));
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
  if (!token) window.location.href = '/login.html';
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
      window.location.href = getDashboardPath(role);
    });
  }
}

// Runs once DOM loaded
document.addEventListener('DOMContentLoaded', () => {
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
  if (socialGoogle) socialGoogle.addEventListener('click', () => window.location.href = '/auth/google');
  if (socialFacebook) socialFacebook.addEventListener('click', () => window.location.href = '/auth/facebook');

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
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setText('loginEmailError'); setText('loginPasswordError'); setText('loginServerError');

      const email = qs('loginEmail').value.trim().toLowerCase();
      const password = qs('loginPassword').value;

      if (!isValidEmail(email)) return setText('loginEmailError', 'Enter a valid email');
      if (!password) return setText('loginPasswordError', 'Enter your password');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email, password })
        });
        const body = await res.json().catch(()=>null);
        if (res.ok && body?.token) return saveTokenAndRedirect(body.token, body?.user?.role || body?.role);
        setText('loginServerError', (body && (body.message || body.error)) || 'Login failed');
      } catch (err) {
        setText('loginServerError', 'Network error');
      }
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
      if (!isNameValid(first_name)) { setText('firstNameError','Enter a valid first name'); invalid = true; }
      if (!isNameValid(last_name)) { setText('lastNameError','Enter a valid last name'); invalid = true; }
      if (!isValidEmail(email)) { setText('signupEmailError','Enter a valid email'); invalid = true; }
      if (!password || password.length < 6) { setText('signupPasswordError','Password must be at least 6 characters'); invalid = true; }
      if (role === 'INSTRUCTOR' && !bio) { setText('bioError','Bio is required for instructors'); invalid = true; }
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
        if (res.status === 201 || res.status === 200) return window.location.href = '/login.html';
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
        const res = await fetch('/api/password/forgot', {
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
        const res = await fetch('/api/password/reset', {
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

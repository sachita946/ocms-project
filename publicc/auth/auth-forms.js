/* Enhanced Auth Forms with Forgot Password, OAuth, and improved error handling */

const qs = id => document.getElementById(id);
const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

/* --------------------------- LOGIN --------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  // Check for OAuth errors
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error === 'oauth_failed') {
    qs("loginServerError") && (qs("loginServerError").textContent = "OAuth login failed. Please try again.");
  } else if (error === 'no_email') {
    qs("loginServerError") && (qs("loginServerError").textContent = "No email provided by OAuth provider.");
  }

  /* LOGIN SUBMIT */
  qs("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    qs("loginEmailError").textContent = "";
    qs("loginPasswordError").textContent = "";
    qs("loginServerError").textContent = "";

    const email = qs("loginEmail").value.trim().toLowerCase();
    const password = qs("loginPassword").value.trim();

    if (!isValidEmail(email))
      return qs("loginEmailError").textContent = "Enter valid email";

    if (!password)
      return qs("loginPasswordError").textContent = "Enter password";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.token) {
        // Show error with signup prompt if credentials are wrong
        const errorMsg = data?.message || "Login failed";
        qs("loginServerError").innerHTML = 
          `${errorMsg}. <a href="/auth/signup.html" style="color: #4CAF50; text-decoration: underline;">Sign up here</a>`;
        return;
      }

      // Store token
      localStorage.setItem("ocms_token", data.token);
      localStorage.setItem("ocms_role", data.user?.role);

      // Redirect based on role
      if (data.user?.role === "STUDENT") return location.href = "/student/student-dashboard.html";
      if (data.user?.role === "INSTRUCTOR") return location.href = "/instructor/instructor-dashboard.html";
      if (data.user?.role === "ADMIN") return location.href = "/admin/dashboard.html";

      location.href = "/index.html";

    } catch {
      qs("loginServerError").textContent = "Network error. Please check your connection.";
    }
  });

  /* ------------------------- FORGOT PASSWORD ------------------------- */

  qs("showForgotBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    qs("forgot").style.display = "block";
    qs("forgotEmail")?.focus();
  });

  qs("cancelForgot")?.addEventListener("click", (e) => {
    e.preventDefault();
    qs("forgot").style.display = "none";
    qs("forgotEmail").value = "";
    qs("forgotEmailError").textContent = "";
    qs("forgotServerError").textContent = "";
    qs("forgotSuccess").textContent = "";
  });

  qs("forgotForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    qs("forgotEmailError").textContent = "";
    qs("forgotServerError").textContent = "";
    qs("forgotSuccess").textContent = "";

    const email = qs("forgotEmail").value.trim().toLowerCase();

    if (!isValidEmail(email))
      return qs("forgotEmailError").textContent = "Enter valid email";

    try {
      const res = await fetch("/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok)
        return qs("forgotServerError").textContent = data?.message || "Failed to send reset link";

      // Show success message with token (for development)
      qs("forgotSuccess").innerHTML = 
        `Reset link sent to <strong>${email}</strong>. Check your email!<br>` +
        `<small style="color: #888;">(Dev mode: Use token below to reset password)</small>`;
      
      // Show reset form
      if (data.resetToken) {
        qs("reset").style.display = "block";
        qs("resetToken").value = data.resetToken;
        console.log("Reset Token:", data.resetToken);
      }

    } catch {
      qs("forgotServerError").textContent = "Network error. Please try again.";
    }
  });

  /* ------------------------- RESET PASSWORD ------------------------- */

  qs("cancelReset")?.addEventListener("click", (e) => {
    e.preventDefault();
    qs("reset").style.display = "none";
    qs("resetToken").value = "";
    qs("newPassword").value = "";
    qs("resetTokenError").textContent = "";
    qs("newPasswordError").textContent = "";
    qs("resetServerError").textContent = "";
    qs("resetSuccess").textContent = "";
  });

  qs("resetForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    qs("resetTokenError").textContent = "";
    qs("newPasswordError").textContent = "";
    qs("resetServerError").textContent = "";
    qs("resetSuccess").textContent = "";

    const token = qs("resetToken").value.trim();
    const password = qs("newPassword").value.trim();

    if (!token)
      return qs("resetTokenError").textContent = "Enter reset token";

    if (!password || password.length < 6)
      return qs("newPasswordError").textContent = "Password must be at least 6 characters";

    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok)
        return qs("resetServerError").textContent = data?.message || "Failed to reset password";

      // Show success and redirect to login
      qs("resetSuccess").innerHTML = 
        `<span style="color: #4CAF50;">✓ Password reset successful!</span> Redirecting to login...`;
      
      setTimeout(() => {
        location.href = "/auth/login.html";
      }, 2000);

    } catch {
      qs("resetServerError").textContent = "Network error. Please try again.";
    }
  });

  /* ------------------------- SOCIAL LOGIN ------------------------- */

  qs("socialGoogleBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/api/oauth/google";
  });

  qs("socialFacebookBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/api/oauth/facebook";
  });

  /* --------------------------- OAuth Success Redirect --------------------------- */

  const token = params.get("token");
  const role = params.get("role");

  if (token) {
    localStorage.setItem("ocms_token", token);
    if (role) localStorage.setItem("ocms_role", role);

    // Remove params from URL
    window.history.replaceState({}, "", window.location.pathname);

    // Redirect based on role
    if (role === "STUDENT") return location.href = "/student/student-dashboard.html";
    if (role === "INSTRUCTOR") return location.href = "/instructor/instructor-dashboard.html";
    if (role === "ADMIN") return location.href = "/admin/dashboard.html";

    return location.href = "/index.html";
  }
});

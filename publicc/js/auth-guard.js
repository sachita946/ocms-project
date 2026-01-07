// Authentication Guard
// publicc/js/auth-guard.js

import { isAuthenticated, getUserRole } from './api-service.js';
import { USER_ROLES, ROUTES } from './constants.js';

// Check if user is authenticated and redirect if not
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = ROUTES.LOGIN;
    return false;
  }
  return true;
}

// Check if user has required role
export function requireRole(requiredRole) {
  if (!requireAuth()) return false;

  const userRole = getUserRole();
  if (userRole !== requiredRole && userRole !== USER_ROLES.ADMIN) {
    // Redirect to appropriate dashboard or show error
    redirectToDashboard(userRole);
    return false;
  }
  return true;
}

// Redirect user to their appropriate dashboard
export function redirectToDashboard(role) {
  switch (role) {
    case USER_ROLES.STUDENT:
      window.location.href = window.location.origin + '/publicc/student/student-dashboard.html';
      break;
    case USER_ROLES.INSTRUCTOR:
      window.location.href = window.location.origin + '/publicc/instructor/instructor-dashboard.html';
      break;
    case USER_ROLES.ADMIN:
      window.location.href = window.location.origin + '/publicc/admin/dashboard.html';
      break;
    default:
      window.location.href = window.location.origin + '/publicc/auth/login.html';
  }
}

// Check authentication on page load
export function initAuthGuard() {
  // Skip auth check for public pages
  const publicPages = [
    '/publicc/index.html',
    '/publicc/auth/login.html',
    '/publicc/auth/signup.html',
    '/publicc/student/student-signup.html',
    '/publicc/instructor/instructor-signup.html',
    '/publicc/privacy.html',
    '/publicc/terms.html',
    '/publicc/about.html',
    '/publicc/contact.html',
    '/publicc/faq.html',
    '/publicc/support.html'
  ];

  const currentPath = window.location.pathname;
  const isPublicPage = publicPages.some(page => currentPath.endsWith(page) || currentPath === '/');

  if (!isPublicPage) {
    requireAuth();
  }

  // Add logout functionality to logout buttons
  const logoutButtons = document.querySelectorAll('[data-logout]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', handleLogout);
  });
}

// Handle logout
export async function handleLogout(event) {
  event.preventDefault();

  try {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('ocms_token');
    localStorage.removeItem('ocms_user_role');

    // Show success message
    showToast('Logged out successfully', 'success');

    // Redirect to login after short delay
    setTimeout(() => {
      window.location.href = window.location.origin + '/publicc/auth/login.html';
    }, 1000);
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if there's an error
    window.location.href = window.location.origin + '/publicc/auth/login.html';
  }
}

// Utility function to show toast messages
function showToast(message, type = 'info') {
  // Create or reuse toast container
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Initialize auth guard when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuthGuard);
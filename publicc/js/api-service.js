// Centralized API Service Layer
// publicc/js/api-service.js

const BACKEND_ORIGIN = (window.OCMS_API_ORIGIN)
  || 'http://localhost:3000';
const API_BASE = `${BACKEND_ORIGIN}/api`;

// Auth helper functions
export function getAuthToken() {
  return localStorage.getItem('token') || localStorage.getItem('ocms_token');
}

export function getUserRole() {
  return localStorage.getItem('role') || localStorage.getItem('ocms_role') || localStorage.getItem('ocms_user_role');
}

export function saveAuth(token, role) {
  // Keep both legacy and new keys for compatibility across pages
  localStorage.setItem('token', token);
  localStorage.setItem('ocms_token', token);
  if (role) {
    localStorage.setItem('role', role);
    localStorage.setItem('ocms_role', role);
  }
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('ocms_token');
  localStorage.removeItem('role');
  localStorage.removeItem('ocms_role');
  localStorage.removeItem('ocms_user_role');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

// Base API Service Class
class ApiService {
  constructor(baseURL = API_BASE) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      // Handle unauthorized responses
      if (response.status === 401) {
        clearAuth();
        window.location.href = '/auth/login.html';
        throw new Error('Unauthorized - redirecting to login');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // HTTP method convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Domain-specific service classes
export class AuthService extends ApiService {
  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    saveAuth(data.token, data.user.role);
    return data;
  }

  async signup(userData) {
    const data = await this.post('/auth/signup', userData);
    // Don't automatically save auth - let user login manually
    return data;
  }

  async logout() {
    clearAuth();
    window.location.href = '/auth/login.html';
  }

  async getProfile() {
    return this.get('/auth/me');
  }
}

export class CourseService extends ApiService {
  getAllCourses() {
    return this.get('/courses');
  }

  getCourse(id) {
    return this.get(`/courses/${id}`);
  }

  createCourse(courseData) {
    return this.post('/courses', courseData);
  }

  updateCourse(id, courseData) {
    return this.put(`/courses/${id}`, courseData);
  }

  deleteCourse(id) {
    return this.delete(`/courses/${id}`);
  }

  enrollInCourse(courseId) {
    return this.post('/enrollments', { course_id: courseId });
  }

  unenrollFromCourse(enrollmentId) {
    return this.delete(`/enrollments/${enrollmentId}`);
  }

  getMyEnrollments() {
    return this.get('/enrollments/my');
  }
}

export class QuizService extends ApiService {
  getQuizByLesson(lessonId) {
    return this.get(`/quizzes/lesson/${lessonId}`);
  }

  submitQuizAttempt(quizId, answers) {
    return this.post(`/quizzes/${quizId}/attempt`, { answers });
  }
}

export class PaymentService extends ApiService {
  payForCourse(courseId, paymentData) {
    return this.post('/payments/pay', { course_id: courseId, ...paymentData });
  }

  getPaymentHistory() {
    return this.get('/payments/my');
  }
}

// Create singleton instances
export const authService = new AuthService();
export const courseService = new CourseService();
export const quizService = new QuizService();
export const paymentService = new PaymentService();

// Utility functions for common operations
export async function handleApiError(error, context = '') {
  console.error(`${context} Error:`, error);

  if (error.message.includes('Unauthorized')) {
    clearAuth();
    window.location.href = '/auth/login.html';
    return;
  }

  // Show user-friendly error message
  showToast(error.message || 'An error occurred', 'error');
}

export function showToast(message, type = 'info') {
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

// Loading state management
export function showLoading(elementId, message = 'Loading...') {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  element.classList.add('loading');
}

export function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.remove('loading');
  // Note: Content should be restored by the calling code
}

// Form validation helpers
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password);
}

export function showFieldError(inputElement, errorElement, message) {
  inputElement.classList.add('error-input');
  inputElement.classList.remove('success-input');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

export function clearFieldError(inputElement, errorElement) {
  inputElement.classList.remove('error-input');
  inputElement.classList.add('success-input');
  errorElement.textContent = '';
  errorElement.style.display = 'none';
}
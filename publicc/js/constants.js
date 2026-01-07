// Application Constants
// publicc/js/constants.js

// Authentication
export const AUTH_TOKEN_KEY = 'token';
export const USER_ROLE_KEY = 'role';

// API base: resolve backend origin for dev/served-from-different-host cases
export const BACKEND_ORIGIN = (window.OCMS_API_ORIGIN)
  || 'http://localhost:3000';
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;

// Validation
export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Cannot connect to server. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  INTERNAL_ERROR: 'An internal server error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DUPLICATE_ERROR: 'This item already exists.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter.',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter.',
  PASSWORD_MISSING_NUMBER: 'Password must contain at least one number.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_URL: 'Please enter a valid URL.',
  NAME_TOO_SHORT: `Name must be at least ${NAME_MIN_LENGTH} characters long.`
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Redirecting...',
  SIGNUP_SUCCESS: 'Account created successfully! Redirecting...',
  COURSE_CREATED: 'Course created successfully!',
  ENROLLMENT_SUCCESS: 'Successfully enrolled in course!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  QUIZ_SUBMITTED: 'Quiz submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login.html',
  SIGNUP: '/auth/signup.html',
  STUDENT_DASHBOARD: '/student/student-dashboard.html',
  INSTRUCTOR_DASHBOARD: '/instructor/instructor-dashboard.html',
  ADMIN_DASHBOARD: '/admin/dashboard.html',
  STUDENT_SIGNUP: '/student/student-signup.html',
  INSTRUCTOR_SIGNUP: '/instructor/instructor-signup.html',
  COURSES: '/student/courses.html',
  CREATE_COURSE: '/instructor/create-course.html'
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN'
};

// Course Categories
export const COURSE_CATEGORIES = [
  'General',
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Engineering',
  'Health & Medicine',
  'Arts & Humanities',
  'Language Learning'
];

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
};

// Quiz Question Types
export const QUIZ_QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// UI Constants
export const TOAST_DURATION = 5000; // 5 seconds
export const LOADING_DELAY = 300; // 300ms delay before showing loading state
export const DEBOUNCE_DELAY = 300; // 300ms for input debouncing

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
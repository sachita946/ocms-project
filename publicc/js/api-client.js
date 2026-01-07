// Global API helper with robust base resolution
const OCMS_BACKEND_ORIGIN = (window.OCMS_API_ORIGIN)
  || 'http://localhost:3000';
const API_BASE = `${OCMS_BACKEND_ORIGIN}/api`;

// Fetch with authentication
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/auth/login.html';
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
}

// GET request
async function apiGet(endpoint) {
  return apiCall(endpoint, { method: 'GET' });
}

// POST request
async function apiPost(endpoint, body) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// PUT request
async function apiPut(endpoint, body) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

// DELETE request
async function apiDelete(endpoint) {
  return apiCall(endpoint, { method: 'DELETE' });
}

// Backward compatible fetch helper for admin pages
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
}

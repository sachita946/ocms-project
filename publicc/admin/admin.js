// Authentication & Authorization
const checkAuth = () => {
  const token = localStorage.getItem('ocms_token');
  const userRole = localStorage.getItem('user_role');
  
  if (!token || userRole !== 'ADMIN') {
    window.location.href = '/auth/login.html';
    return false;
  }
  return token;
};

// DOM Helper
const $ = (id) => document.getElementById(id);

// Formatting Functions
const fmtCurrency = (n) => `$${(n || 0).toFixed(2)}`;
const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const stars = (n) => {
  const full = Math.floor(n || 0);
  const partial = (n % 1) ? '✨' : '';
  return '⭐'.repeat(full) + partial;
};

// Navigation Setup
const setupNavigation = () => {
  document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  });
};

// Logout Handler
const setupLogout = () => {
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('ocms_token');
      localStorage.removeItem('user_role');
      window.location.href = '/auth/login.html';
    });
  }
};

// API Fetch with Auth
const fetchAPI = async (url) => {
  const token = localStorage.getItem('ocms_token');
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
      window.location.href = '/auth/login.html';
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
};

// Initialize Admin Page
const initAdminPage = () => {
  checkAuth();
  setupNavigation();
  setupLogout();
};

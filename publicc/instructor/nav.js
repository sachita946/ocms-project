// Instructor navigation helper - add to all instructor pages
const instructorNav = `
<style>
  .instructor-nav-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 260px;
    height: 100vh;
    background: linear-gradient(180deg, rgba(6, 9, 20, 0.95) 0%, rgba(8, 12, 30, 0.95) 100%);
    padding: 24px;
    border-right: 1px solid rgba(255,255,255,0.08);
    overflow-y: auto;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }
  .instructor-nav-brand {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 28px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(6,182,212,0.1);
  }
  .instructor-nav-brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #06b6d4, #38bdf8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 18px;
  }
  .instructor-nav-brand-text {
    font-weight: 600;
    font-size: 13px;
    color: #e9f2ff;
  }
  .instructor-nav-menu {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 28px;
    flex: 1;
  }
  .instructor-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid transparent;
    color: #b0b0b0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
  }
  .instructor-nav-item:hover {
    background: rgba(255,255,255,0.12);
    color: #f0f0f0;
    border-color: rgba(255,255,255,0.15);
  }
  .instructor-nav-item.active {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    color: white;
    border-color: rgba(255,255,255,0.2);
    box-shadow: 0 4px 12px rgba(6,182,212,0.4);
  }
  .instructor-nav-logout {
    margin-top: auto;
    background: linear-gradient(135deg, rgba(255,107,107,0.1), rgba(239,68,68,0.1));
    border-color: rgba(255,107,107,0.4);
    color: #ff8787;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .instructor-nav-logout:hover {
    background: linear-gradient(135deg, rgba(255,107,107,0.2), rgba(239,68,68,0.2));
    border-color: rgba(255,107,107,0.6);
    color: #ff6b6b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255,107,107,0.3);
  }
  .instructor-page-wrapper {
    margin-left: 260px;
    min-height: 100vh;
  }
  @media (max-width: 768px) {
    .instructor-nav-sidebar { width: 100%; height: auto; position: relative; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .instructor-page-wrapper { margin-left: 0; }
    .instructor-nav-menu { flex-direction: row; overflow-x: auto; gap: 8px; }
  }

  /* Toast animations */
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
</style>
<aside class="instructor-nav-sidebar">
  <div class="instructor-nav-brand">
    <div class="instructor-nav-brand-icon">🎓</div>
    <div class="instructor-nav-brand-text">INSTRUCTOR</div>
  </div>
  <nav class="instructor-nav-menu" id="instructorNavMenu">
    <a href="instructor-dashboard.html" class="instructor-nav-item" data-page="dashboard">📊 Dashboard</a>
    <a href="create-course.html" class="instructor-nav-item" data-page="create">📖 Create Course</a>
    <a href="earnings.html" class="instructor-nav-item" data-page="earnings">💰 Earnings</a>
    <a href="students.html" class="instructor-nav-item" data-page="students">👥 Students</a>
    <a href="quizzes.html" class="instructor-nav-item" data-page="quizzes">📝 Quizzes</a>
    <a href="profile.html" class="instructor-nav-item" data-page="profile">👤 Profile</a>
  </nav>
  <button class="instructor-nav-item instructor-nav-logout" id="instructorLogoutBtn" onclick="instructorLogout()">🚪 Logout</button>
</aside>
`;

// Inject nav and set up page wrapper
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin', instructorNav);
  
  // Wrap main content
  const main = document.querySelector('main') || document.querySelector('.container');
  if (main) {
    main.classList.add('instructor-page-wrapper');
  }
  
  // Set active nav item
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
  const navItems = document.querySelectorAll('[data-page]');
  navItems.forEach(item => {
    const page = item.getAttribute('data-page');
    if (page === currentPage || (currentPage === '' && page === 'dashboard')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});

function instructorLogout() {
  const logoutBtn = document.getElementById('instructorLogoutBtn');
  const originalText = logoutBtn.textContent;

  // Show loading state
  logoutBtn.disabled = true;
  logoutBtn.textContent = '🚪 Logging out...';

  try {
    // Import the clearAuth function dynamically
    import('../js/api-service.js').then(({ clearAuth }) => {
      clearAuth();
      showToast('Logged out successfully', 'success');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/auth/login.html';
      }, 1000);
    }).catch(() => {
      // Fallback if import fails
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('ocms_token');
      localStorage.removeItem('ocms_user_role');
      window.location.href = '/auth/login.html';
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Force logout even if there's an error
    window.location.href = '/auth/login.html';
  }
}

// Toast notification function
function showToast(message, type = 'info') {
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

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

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
    background: transparent;
    border-color: rgba(255,107,107,0.3);
    color: #ff8787;
  }
  .instructor-nav-logout:hover {
    background: rgba(255,107,107,0.1);
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
</style>
<aside class="instructor-nav-sidebar">
  <div class="instructor-nav-brand">
    <div class="instructor-nav-brand-icon">🎓</div>
    <div class="instructor-nav-brand-text">INSTRUCTOR</div>
  </div>
  <nav class="instructor-nav-menu" id="instructorNavMenu">
    <a href="/instructor/instructor-dashboard.html" class="instructor-nav-item" data-page="dashboard">📊 Dashboard</a>
    <a href="/instructor/create-course.html" class="instructor-nav-item" data-page="create">📖 Create Course</a>
    <a href="/instructor/earnings.html" class="instructor-nav-item" data-page="earnings">💰 Earnings</a>
    <a href="/instructor/students.html" class="instructor-nav-item" data-page="students">👥 Students</a>
    <a href="/instructor/quizzes.html" class="instructor-nav-item" data-page="quizzes">📝 Quizzes</a>
    <a href="/instructor/profile.html" class="instructor-nav-item" data-page="profile">👤 Profile</a>
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
  localStorage.removeItem('ocms_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_id');
  window.location.href = '/auth/login.html';
}

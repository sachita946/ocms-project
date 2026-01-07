const token = localStorage.getItem('ocms_token');

const userData = localStorage.getItem('user');
let userRole;
try {
  userRole = userData ? JSON.parse(userData).role : localStorage.getItem('user_role');
} catch (e) {
  userRole = localStorage.getItem('user_role');
}

if (!token || userRole !== 'ADMIN') {
  window.location.href = '../auth/login.html';
}

const $ = (id) => document.getElementById(id);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const fmtCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;

const panels = document.querySelectorAll('.panel');
const navButtons = document.querySelectorAll('[data-section]');
let statsChart = null;
let revenueChart = null;

// Clear authentication data
function clearAuth() {
  localStorage.removeItem('ocms_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('role');
  localStorage.removeItem('ocms_role');
  localStorage.removeItem('ocms_user_role');
  localStorage.removeItem('user');
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

navButtons.forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

$('logoutBtn').addEventListener('click', () => {
  // Clear auth data immediately
  clearAuth();

  // Show success message
  showToast('Logged out successfully', 'success');

  // Redirect immediately
  window.location.href = '/publicc/index.html';
});

function switchSection(section) {
  panels.forEach(p => p.classList.remove('active'));
  navButtons.forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(`section-${section}`);
  if (panel) {
    panel.classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    window.scrollTo(0, 0);
  }
}

function setStats(data = {}) {
  const totalUsers = (data.students || 0) + (data.instructors || 0);
  $('stat-users').textContent = totalUsers;
  $('stat-students').textContent = data.students || 0;
  $('stat-instructors').textContent = data.instructors || 0;
  $('stat-courses').textContent = data.courses || 0;
  $('stat-payments').textContent = fmtCurrency(data.totalRevenue || 0);
  $('stat-reviews').textContent = data.reviews || 0;
}

function renderOverview(data = {}) {
  const list = $('overview-list');
  list.innerHTML = '';
  const items = [
    { emoji: '👥', label: 'Total Users', value: (data.students || 0) + (data.instructors || 0) },
    { emoji: '👨‍🎓', label: 'Students', value: data.students || 0 },
    { emoji: '👨‍🏫', label: 'Instructors', value: data.instructors || 0 },
    { emoji: '📚', label: 'Courses', value: data.courses || 0 },
    { emoji: '💳', label: 'Total Revenue', value: fmtCurrency(data.totalRevenue || 0) },
    { emoji: '⭐', label: 'Total Reviews', value: data.reviews || 0 },
  ];
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<div class="list-content"><div class="list-title">${item.emoji} ${item.label}</div></div><div class="value" style="font-size: 18px; font-weight: 700; color: #ff8787;">${item.value}</div>`;
    list.appendChild(li);
  });

  // Create statistics chart
  if (Chart) {
    const chartContainer = $('statisticsChart');
    if (statsChart) statsChart.destroy();
    
    chartContainer.innerHTML = '<canvas></canvas>';
    const canvas = chartContainer.querySelector('canvas');
    statsChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Instructors', 'Courses'],
        datasets: [{
          data: [data.students || 0, data.instructors || 0, data.courses || 0],
          backgroundColor: ['#ff8787', '#ff7675', '#d63031'],
          borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#ffffff', font: { size: 12 } }
          }
        }
      }
    });
  }
}

function renderUsers(users = []) {
  const tbody = $('users-tbody');
  const empty = $('users-empty');
  const table = $('users-table');
  
  tbody.innerHTML = '';
  
  if (!users.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  table.style.display = 'table';
  
  users.forEach(user => {
    const row = document.createElement('tr');
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
    const status = user.is_active ? '✓ Active' : '✗ Inactive';
    const statusColor = user.is_active ? '#4ade80' : '#f87171';
    row.innerHTML = `
      <td>${name}</td>
      <td>${user.email}</td>
      <td><span class="pill" style="background: rgba(255,107,107,0.2); color: #ff8787;">${user.role}</span></td>
      <td><span style="color: ${statusColor};">${status}</span></td>
      <td>${fmtDate(user.created_at)}</td>
      <td>
        <button class="action-btn" style="padding: 6px 12px;" onclick="viewUser('${user.id}')">View</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderCourses(courses = []) {
  const list = $('courses-list');
  const empty = $('courses-empty');
  
  list.innerHTML = '';
  
  if (!courses.length) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.style.display = 'grid';
  
  courses.forEach(course => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const instructor = course.instructor ? `${course.instructor.first_name || ''} ${course.instructor.last_name || ''}`.trim() : 'Unknown';
    const publishStatus = course.is_published ? '✓ Published' : '📝 Draft';
    const statusColor = course.is_published ? '#4ade80' : '#fbbf24';
    li.innerHTML = `
      <div class="list-content">
        <div class="list-title">${course.title}</div>
        <div class="list-meta">By ${instructor} | Enrollments: ${course._count?.enrollments || 0}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 600; color: #ff8787; margin-bottom: 4px;">${course.price ? fmtCurrency(course.price) : 'Free'}</div>
        <span class="pill" style="background: rgba(255,255,255,0.1); color: ${statusColor};">${publishStatus}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderPayments(payments = []) {
  const tbody = $('payments-tbody');
  const empty = $('payments-empty');
  const table = $('payments-table');
  
  tbody.innerHTML = '';
  
  if (!payments.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  table.style.display = 'table';
  
  payments.forEach(payment => {
    const row = document.createElement('tr');
    const studentName = payment.student ? `${payment.student.full_name}` : 'Unknown';
    const courseName = payment.course?.title || 'Unknown';
    const statusColor = payment.status === 'COMPLETED' ? '#4ade80' : payment.status === 'PENDING' ? '#fbbf24' : '#f87171';
    row.innerHTML = `
      <td>${studentName}</td>
      <td>${courseName}</td>
      <td>${fmtCurrency(payment.amount)}</td>
      <td>${payment.payment_method}</td>
      <td><span style="color: ${statusColor};">${payment.status}</span></td>
      <td>${fmtDate(payment.paid_at)}</td>
    `;
    tbody.appendChild(row);
  });
  
  // Create revenue chart
  if (Chart && payments.length) {
    const chartContainer = $('revenueChart');
    if (revenueChart) revenueChart.destroy();
    
    const paymentsByMonth = {};
    payments.forEach(p => {
      const month = new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      paymentsByMonth[month] = (paymentsByMonth[month] || 0) + Number(p.amount || 0);
    });
    
    chartContainer.innerHTML = '<canvas></canvas>';
    const canvas = chartContainer.querySelector('canvas');
    revenueChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: Object.keys(paymentsByMonth),
        datasets: [{
          label: 'Revenue',
          data: Object.values(paymentsByMonth),
          borderColor: '#ff8787',
          backgroundColor: 'rgba(255,135,135,0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ff8787',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#ffffff', font: { size: 12 } }
          }
        },
        scales: {
          x: { ticks: { color: '#a0a0a0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#a0a0a0' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
        }
      }
    });
  }
}

function renderReviews(reviews = []) {
  const list = $('reviews-list');
  const empty = $('reviews-empty');
  
  list.innerHTML = '';
  
  if (!reviews.length) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.style.display = 'grid';
  
  reviews.forEach(review => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const studentName = review.student?.full_name || 'Anonymous';
    li.innerHTML = `
      <div class="list-content">
        <div class="list-title">${review.course?.title}</div>
        <div class="list-meta">By ${studentName} | ${stars} ${review.rating}/5</div>
        <div class="list-meta" style="margin-top: 6px; color: #999;">${review.comment || 'No comment'}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderNotifications(notifications = []) {
  const list = $('notifications-list');
  const empty = $('notifications-empty');
  
  list.innerHTML = '';
  
  if (!notifications.length) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.style.display = 'grid';
  
  notifications.forEach(notification => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <div class="list-content">
        <div class="list-title">${notification.message}</div>
        <div class="list-meta">${fmtDate(notification.created_at)}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderActivities(activities = []) {
  const list = $('activities-list');
  const empty = $('activities-empty');
  
  list.innerHTML = '';
  
  if (!activities.length) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.style.display = 'grid';
  
  activities.forEach(activity => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const label = activity.course?.title || activity.lesson?.title || 'System Activity';
    li.innerHTML = `
      <div class="list-content">
        <div class="list-title">${label}</div>
        <div class="list-meta">${activity.action || 'Activity'} • ${fmtDate(activity.created_at)}</div>
      </div>
    `;
    list.appendChild(li);
  });
}

async function bootstrap() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) throw new Error('unauthorized');
    const data = await res.json();
    
    setStats(data);
    renderOverview(data);
    renderUsers(data.users || []);
    renderCourses(data.courses || []);
    renderPayments(data.payments || []);
    renderReviews(data.reviews || []);
    renderNotifications(data.notifications || []);
    renderActivities(data.activities || []);
  } catch (err) {
    console.error(err);
    localStorage.removeItem('ocms_token');
    localStorage.removeItem('user_role');
    window.location.href = '/publicc/auth/login.html';
  }
}

function viewUser(userId) {
  alert(`View user ${userId} - Feature coming soon`);
}

function toggleMaintenance() {
  alert('Maintenance mode toggle - Feature coming soon');
}

function managePermissions() {
  alert('Permission management - Feature coming soon');
}

function platformSettings() {
  alert('Platform settings - Feature coming soon');
}

function manageBackups() {
  alert('Backup management - Feature coming soon');
}

bootstrap();

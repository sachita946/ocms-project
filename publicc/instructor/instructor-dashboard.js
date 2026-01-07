const token = localStorage.getItem('ocms_token');
const userRole = localStorage.getItem('user_role');

console.log('Instructor dashboard - token:', !!token);
console.log('Instructor dashboard - userRole:', userRole);

if (!token) {
  console.log('No token found, redirecting to login');
  alert('No authentication token found. Please login first.');
  window.location.href = '../auth/login.html';
}
if (userRole !== 'INSTRUCTOR') {
  console.log('User role is not INSTRUCTOR, redirecting to login. Role:', userRole);
  alert('Access denied. You are not logged in as an instructor. Your role: ' + userRole);
  window.location.href = '../auth/login.html';
}

// Check if instructor is verified
async function checkInstructorVerification() {
  try {
    console.log('Checking instructor verification...');
    const res = await fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Auth/me response status:', res.status);
    
    if (!res.ok) {
      console.error('Auth/me request failed with status:', res.status);
      throw new Error(`Authentication failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Auth/me response data:', data);
    
    if (!data || !data.user) {
      console.error('Invalid response from auth/me');
      throw new Error('Invalid authentication response');
    }
    
    if (data.user?.instructorProfile && !data.user.instructorProfile.is_verified) {
      // For testing purposes, allow access but show a warning
      console.warn('Instructor account not yet verified - allowing access for testing');
      showVerificationWarning();
      return true; // Allow access for testing
    }
    
    console.log('Instructor verification check passed');
    return true;
  } catch (error) {
    console.error('Verification check failed:', error);
    throw error; // Re-throw to stop bootstrap
  }
}

function showVerificationWarning() {
  const warningDiv = document.createElement('div');
  warningDiv.id = 'verification-warning';
  warningDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f59e0b;
    color: #92400e;
    padding: 12px 20px;
    text-align: center;
    font-weight: 600;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  warningDiv.innerHTML = `
    ⚠️ Your instructor account is pending admin approval. Some features may be limited.
    <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: #92400e; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
  `;
  document.body.insertBefore(warningDiv, document.body.firstChild);
}

const $ = (id) => document.getElementById(id);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '';
const fmtCurrency = (n) => {
  const amount = Number(n || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const panels = document.querySelectorAll('.panel');
const navButtons = document.querySelectorAll('[data-section]');
let earningsChart = null;

document.addEventListener('DOMContentLoaded', bootstrap);

navButtons.forEach(btn => btn.addEventListener('click', () => switchSection(btn.dataset.section)));

$('logoutBtn').addEventListener('click', () => {
  // Clear all auth data
  localStorage.removeItem('token');
  localStorage.removeItem('ocms_token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_role');
  localStorage.removeItem('ocms_user_role');
  
  // Redirect to login
  window.location.href = '../auth/login.html';
});

function switchSection(section) {
  panels.forEach(p => p.classList.remove('active'));
  navButtons.forEach(b => b.classList.remove('active'));
  const panel = document.getElementById(`section-${section}`);
  const button = document.querySelector(`[data-section="${section}"]`);
  if (panel) panel.classList.add('active');
  if (button) button.classList.add('active');
  window.scrollTo(0, 0);
}

function setStats(stats = {}) {
  const coursesEl = $('stat-courses');
  const publishedEl = $('stat-published');
  const draftsEl = $('stat-drafts');
  const studentsEl = $('stat-students');
  const revenueEl = $('stat-revenue');
  const reviewsEl = $('stat-reviews');

  if (coursesEl) coursesEl.textContent = stats?.courses ?? 0;
  if (publishedEl) publishedEl.textContent = stats?.published ?? 0;
  if (draftsEl) draftsEl.textContent = stats?.drafts ?? 0;
  if (studentsEl) studentsEl.textContent = stats?.students ?? 0;
  if (revenueEl) revenueEl.textContent = fmtCurrency(stats?.revenue ?? 0);
  if (reviewsEl) reviewsEl.textContent = stats?.reviews ?? 0;
}

function renderHeader(user) {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Instructor';
  const welcomeNameEl = $('welcomeName');
  if (welcomeNameEl) {
    welcomeNameEl.textContent = name;
  }
}

function renderOverview(dashboard) {
  const list = $('overview-list');
  if (!list) return;
  
  list.innerHTML = '';
  const items = [
    { label: '📚 Courses', value: dashboard?.stats?.courses },
    { label: '✅ Published', value: dashboard?.stats?.published },
    { label: '👥 Students', value: dashboard?.stats?.students },
    { label: '💰 Revenue', value: fmtCurrency(dashboard?.stats?.revenue || 0) },
  ];
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<div><strong>${item.value ?? 0}</strong><div class="muted">${item.label}</div></div>`;
    list.appendChild(li);
  });
}

function renderCourses(courses = []) {
  const list = $('courses-list');
  if (!list) return;
  
  list.innerHTML = '';
  if (!courses.length) {
    list.innerHTML = '<div class="muted" style="padding:12px">No courses created yet. Click "New Course" to start!</div>';
    return;
  }
  courses.forEach(c => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const statusColor = c.published ? '#22c55e' : '#f97316';
    li.innerHTML = `<div><div style="font-weight:600">${c.title}</div><div class="muted">Lessons: ${c.lessons || 0} · Reviews: ${c.reviews || 0} · Enrolled: ${c.enrollments || 0}</div></div><div style="display:flex;gap:8px;align-items:center"><span class="pill" style="background:${statusColor}33;color:${statusColor}">${c.published ? '✓ Published' : '📝 Draft'}</span><span class="pill">${fmtCurrency(c.revenue || 0)}</span></div>`;
    list.appendChild(li);
  });
}

function renderEarnings(dashboard) {
  const list = $('earnings-list');
  if (!list) {
    console.warn('Earnings list container not found');
    return;
  }
  
  list.innerHTML = '';
  
  const courses = dashboard?.lists?.courses || [];
  const totalRevenue = courses.reduce((sum, c) => sum + (c.revenue || 0), 0);
  
  if (!courses.length) {
    list.innerHTML = '<div class="muted" style="padding:12px">No earnings yet. Create courses to start earning!</div>';
    return;
  }

  // Create earnings chart
  const labels = courses.map(c => c.title);
  const revenueData = courses.map(c => c.revenue || 0);
  const enrollmentData = courses.map(c => c.enrollments || 0);

  const ctx = $('earningsChart');
  if (ctx && earningsChart) earningsChart.destroy();
  
  if (ctx) {
    earningsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            backgroundColor: '#06b6d4',
            borderRadius: 6
          },
          {
            label: 'Enrollments',
            data: enrollmentData,
            backgroundColor: '#38bdf8',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#e9f2ff' } }
        },
        scales: {
          y: {
            ticks: { color: '#9bb0c9' },
            grid: { color: 'rgba(255,255,255,0.08)' }
          },
          x: {
            ticks: { color: '#9bb0c9' },
            grid: { color: 'rgba(255,255,255,0.08)' }
          }
        }
      }
    });
  }

  // Render earnings list
  courses.forEach(c => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<div><div style="font-weight:600">${c.title}</div><div class="muted">${c.enrollments || 0} students · ${c.lessons || 0} lessons</div></div><div><div style="color:#06b6d4;font-weight:600;text-align:right">${fmtCurrency(c.revenue || 0)}</div><div class="muted" style="text-align:right;font-size:12px">${(c.revenue / (c.enrollments || 1)) | 0} per student</div></div>`;
    list.appendChild(li);
  });
}

function renderLessons(courses = []) {
  const list = $('lessons-list');
  if (!list) {
    console.warn('Lessons list container not found');
    return;
  }
  
  list.innerHTML = '';
  
  const allLessons = [];
  courses.forEach(c => {
    if (c.lessons && Array.isArray(c.lessons)) {
      c.lessons.forEach(lesson => {
        allLessons.push({ ...lesson, courseName: c.title });
      });
    }
  });

  if (!allLessons.length) {
    list.innerHTML = '<div class="muted" style="padding:12px">No lessons created yet. Add lessons to your courses!</div>';
    return;
  }

  allLessons.forEach(l => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<div><div style="font-weight:600">${l.title || l.name}</div><div class="muted">${l.courseName}</div></div><span class="pill">${l.videoUrl ? '▶ Video' : l.documentUrl ? '📄 Doc' : '📝 Content'}</span>`;
    list.appendChild(li);
  });
}

function renderStudents(courses = []) {
  const list = $('students-list');
  if (!list) {
    console.warn('Students list container not found');
    return;
  }
  
  list.innerHTML = '';
  
  const allStudents = new Map();
  courses.forEach(c => {
    if (c.enrollments && Array.isArray(c.enrollments)) {
      c.enrollments.forEach(enrollment => {
        const studentId = enrollment.student?.id || enrollment.userId;
        if (studentId && !allStudents.has(studentId)) {
          allStudents.set(studentId, {
            ...enrollment.student,
            courses: [c.title]
          });
        } else if (studentId) {
          allStudents.get(studentId).courses.push(c.title);
        }
      });
    }
  });

  if (allStudents.size === 0) {
    list.innerHTML = '<div class="muted" style="padding:12px">No students enrolled yet. Create courses and promote them!</div>';
    return;
  }

  Array.from(allStudents.values()).slice(0, 50).forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const courseText = s.courses.length === 1 ? '1 course' : `${s.courses.length} courses`;
    li.innerHTML = `<div><div style="font-weight:600">${s.first_name || ''} ${s.last_name || ''}</div><div class="muted">${s.email}</div><div class="muted" style="font-size:12px;margin-top:4px">${courseText}</div></div><span class="pill" style="background:#22c55e33;color:#22c55e">✓ Active</span>`;
    list.appendChild(li);
  });
}

function renderQuizzes(courses = []) {
  const list = $('quizzes-list');
  if (!list) {
    console.warn('Quizzes list container not found');
    return;
  }
  
  list.innerHTML = '';
  
  const allQuizzes = [];
  courses.forEach(c => {
    if (c.quizzes && Array.isArray(c.quizzes)) {
      c.quizzes.forEach(quiz => {
        allQuizzes.push({ ...quiz, courseName: c.title });
      });
    }
  });

  if (!allQuizzes.length) {
    list.innerHTML = '<div class="muted" style="padding:12px">No quizzes created yet. Create quizzes to assess student learning!</div>';
    return;
  }

  allQuizzes.forEach(q => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const questionsText = q.questions ? (Array.isArray(q.questions) ? `${q.questions.length} questions` : 'Multiple questions') : 'Questions added';
    li.innerHTML = `<div><div style="font-weight:600">${q.title || q.name}</div><div class="muted">${q.courseName} · ${questionsText}</div></div><span class="pill">${q.passing_score || 60}% pass</span>`;
    list.appendChild(li);
  });
}

function renderProfile(user) {
  const list = $('profile-list');
  if (!list) {
    console.warn('Profile list container not found');
    return;
  }
  
  list.innerHTML = '';
  
  const profileItems = [
    { label: 'Name', value: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'N/A' },
    { label: 'Email', value: user?.email || 'N/A' },
    { label: 'Member Since', value: fmtDate(user?.created_at) || 'N/A' },
    { label: 'Expertise', value: user?.instructorProfile?.expertise_area || 'Not specified' },
    { label: 'Website', value: user?.instructorProfile?.website || 'Not specified' },
    { label: 'Verification Status', value: user?.instructorProfile?.is_verified ? '✓ Verified' : '⏳ Not Verified' },
  ];

  profileItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<div><div class="muted">${item.label}</div><div style="font-weight:600;margin-top:4px">${item.value}</div></div>`;
    list.appendChild(li);
  });
}

function renderNotifications(items = [], activities = []) {
  const notifList = $('notifications-list');
  if (!notifList) {
    console.warn('Notifications list container not found');
    return;
  }

  notifList.innerHTML = '';
  if (!items.length && !activities.length) {
    notifList.innerHTML = '<div class="muted" style="padding:12px">No new notifications or activity.</div>';
    return;
  }

  // Render notifications
  if (items.length > 0) {
    items.forEach(n => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<div>${n.message || 'Notification'}</div><div class="muted">${fmtDate(n.created_at)}</div>`;
      notifList.appendChild(li);
    });
  }

  // Render activities
  if (activities.length > 0) {
    activities.forEach(a => {
      const li = document.createElement('li');
      li.className = 'list-item';
      const label = a.course?.title || a.lesson?.title || 'Course activity';
      li.innerHTML = `<div><div style="font-weight:600">${label}</div><div class="muted">${a.action || 'Activity'}</div></div><div class="muted">${fmtDate(a.created_at)}</div>`;
      notifList.appendChild(li);
    });
  }
}

async function bootstrap() {
  console.log('Starting instructor dashboard bootstrap...');
  
  try {
    // Check if instructor is verified first
    await checkInstructorVerification();
    
    console.log('Fetching profile data...');
    const res = await fetch('http://localhost:3000/api/profile/me', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Profile/me response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`Profile fetch failed: ${res.status}`);
    }
    
    const payload = await res.json();
    console.log('Profile data received:', payload);
    
    if (!payload || !payload.user || !payload.dashboard) {
      throw new Error('Invalid profile data received');
    }
    
    if (payload.dashboard?.role !== 'INSTRUCTOR') {
      console.log('Role check failed, redirecting to student page');
      window.location.href = '../student/courses.html';
      return;
    }

    const dashboard = payload.dashboard;
    const user = payload.user;

    renderHeader(user);
    setStats(dashboard.stats || {});
    renderOverview(dashboard);
    renderCourses(dashboard.lists?.courses || []);
    renderEarnings(dashboard);
    renderLessons(dashboard.lists?.courses || []);
    renderStudents(dashboard.lists?.courses || []);
    renderQuizzes(dashboard.lists?.courses || []);
    renderProfile(user);
    renderNotifications(dashboard.lists?.notifications || [], dashboard.lists?.activities || []);
    
    console.log('Dashboard bootstrap completed successfully');
  } catch (err) {
    console.error('Bootstrap failed:', err.message);
    // Clear invalid tokens and redirect to login
    localStorage.removeItem('ocms_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user');
    window.location.href = '../auth/login.html';
  }
}

// Helper functions
function goToCreateCourse() {
  window.location.href = 'create-course.html';
}

function editProfile() {
  alert('Profile edit feature coming soon!');
  // window.location.href = '/instructor/profile.html';
}

function changePassword() {
  alert('Change password feature coming soon!');
}

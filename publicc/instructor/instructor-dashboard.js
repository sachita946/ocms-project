const token = localStorage.getItem('ocms_token');
if (!token) window.location.href = '/auth/login.html';

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
  localStorage.removeItem('ocms_token');
  window.location.href = '/auth/login.html';
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
  $('stat-courses').textContent = stats.courses ?? 0;
  $('stat-published').textContent = stats.published ?? 0;
  $('stat-drafts').textContent = stats.drafts ?? 0;
  $('stat-students').textContent = stats.students ?? 0;
  $('stat-revenue').textContent = fmtCurrency(stats.revenue ?? 0);
  $('stat-reviews').textContent = stats.reviews ?? 0;
}

function renderHeader(user) {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Instructor';
  $('welcomeName').textContent = name;
  $('userName').textContent = name;
  $('userEmail').textContent = user.email;
  $('avatar').textContent = name.charAt(0).toUpperCase();
}

function renderOverview(dashboard) {
  const list = $('overview-list');
  list.innerHTML = '';
  const items = [
    { label: '📚 Courses', value: dashboard.stats?.courses },
    { label: '✅ Published', value: dashboard.stats?.published },
    { label: '👥 Students', value: dashboard.stats?.students },
    { label: '💰 Revenue', value: fmtCurrency(dashboard.stats?.revenue || 0) },
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
  list.innerHTML = '';
  
  const courses = dashboard.lists?.courses || [];
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
  list.innerHTML = '';
  
  const profileItems = [
    { label: 'Name', value: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A' },
    { label: 'Email', value: user.email || 'N/A' },
    { label: 'Member Since', value: fmtDate(user.created_at) || 'N/A' },
    { label: 'Expertise', value: user.instructorProfile?.expertise_area || 'Not specified' },
    { label: 'Website', value: user.instructorProfile?.website || 'Not specified' },
    { label: 'Verification Status', value: user.instructorProfile?.is_verified ? '✓ Verified' : '⏳ Not Verified' },
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
  notifList.innerHTML = '';
  if (!items.length) notifList.innerHTML = '<div class="muted" style="padding:12px">No new notifications.</div>';
  items.forEach(n => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `<div>${n.message}</div><div class="muted">${fmtDate(n.created_at)}</div>`;
    notifList.appendChild(li);
  });

  const activityList = $('activities-list');
  activityList.innerHTML = '';
  if (!activities.length) activityList.innerHTML = '<div class="muted" style="padding:12px">No recent activity.</div>';
  activities.forEach(a => {
    const li = document.createElement('li');
    li.className = 'list-item';
    const label = a.course?.title || a.lesson?.title || 'Course activity';
    li.innerHTML = `<div><div style="font-weight:600">${label}</div><div class="muted">${a.action || 'Activity'}</div></div><div class="muted">${fmtDate(a.created_at)}</div>`;
    activityList.appendChild(li);
  });
}

async function bootstrap() {
  try {
    const res = await fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) throw new Error('unauthorized');
    const payload = await res.json();
    
    if (payload.dashboard?.role !== 'INSTRUCTOR') {
      window.location.href = '/student/student-dashboard.html';
      return;
    }

    const dashboard = payload.dashboard;
    const user = payload.user;

    renderHeader(user);
    setStats(dashboard.stats);
    renderOverview(dashboard);
    renderCourses(dashboard.lists?.courses || []);
    renderEarnings(dashboard);
    renderLessons(dashboard.lists?.courses || []);
    renderStudents(dashboard.lists?.courses || []);
    renderQuizzes(dashboard.lists?.courses || []);
    renderProfile(user);
    renderNotifications(dashboard.lists?.notifications || [], dashboard.lists?.activities || []);
  } catch (err) {
    console.error(err);
    localStorage.removeItem('ocms_token');
    window.location.href = '/auth/login.html';
  }
}

// Helper functions
function goToCreateCourse() {
  window.location.href = '/instructor/create-course.html';
}

function editProfile() {
  alert('Profile edit feature coming soon!');
  // window.location.href = '/instructor/profile.html';
}

function changePassword() {
  alert('Change password feature coming soon!');
}

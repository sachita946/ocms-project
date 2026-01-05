// Student Resources View (Read-only)
const token = localStorage.getItem('ocms_token');
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
  });
});

// Load enrolled courses
async function loadMyCourses() {
  try {
    const res = await fetch('/api/profile/me', { headers });
    const data = await res.json();
    const enrollments = data.enrollments || [];

    const options = enrollments.map(e => `<option value="${e.courseId}">${e.courseTitle}</option>`).join('');
    document.getElementById('courseSelect').innerHTML = `<option value="">All Courses</option>${options}`;
    document.getElementById('lessonCourseSelect').innerHTML = `<option value="">All Courses</option>${options}`;
  } catch (err) {
    console.error('Load courses error:', err);
  }
}

// Load lessons when course is selected
document.getElementById('lessonCourseSelect').addEventListener('change', async (e) => {
  const courseId = e.target.value;
  if (!courseId) {
    document.getElementById('lessonSelect').innerHTML = '<option value="">All Lessons</option>';
    return;
  }

  try {
    const res = await fetch(`/api/lessons/course/${courseId}`, { headers });
    const lessons = await res.json();
    const options = lessons.map(l => `<option value="${l.id}">${l.title}</option>`).join('');
    document.getElementById('lessonSelect').innerHTML = `<option value="">All Lessons</option>${options}`;
  } catch (err) {
    console.error('Load lessons error:', err);
  }
});

// Load Course Resources
async function loadCourseResources() {
  const courseId = document.getElementById('courseSelect').value;
  const type = document.getElementById('courseTypeFilter').value;
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  if (type) params.append('type', type);

  try {
    const res = await fetch(`/api/course-resources?${params}`, { headers });
    const resources = await res.json();

    if (!resources.length) {
      document.getElementById('courseResourcesList').innerHTML = '<div class="empty-state"><p>No resources available yet</p></div>';
      return;
    }

    document.getElementById('courseResourcesList').innerHTML = resources.map(r => `
      <div class="resource-card">
        <div class="resource-header">
          <h3>${r.title}</h3>
          <span class="badge ${r.type}">${r.type}</span>
        </div>
        <div class="resource-content">
          <pre>${r.content}</pre>
          ${r.zoom_link ? `<p><strong>Zoom Meeting:</strong> <a href="${r.zoom_link}" target="_blank" class="zoom-link">Join Meeting</a></p>` : ''}
        </div>
        <div class="resource-footer">
          <small>Added by ${r.user?.first_name || 'Instructor'} on ${new Date(r.created_at).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load course resources error:', err);
    document.getElementById('courseResourcesList').innerHTML = '<p class="error">Failed to load resources</p>';
  }
}

// Load Lesson Resources
async function loadLessonResources() {
  const lessonId = document.getElementById('lessonSelect').value;
  const type = document.getElementById('lessonTypeFilter').value;
  const params = new URLSearchParams();
  if (lessonId) params.append('lesson_id', lessonId);
  if (type) params.append('type', type);

  try {
    const res = await fetch(`/api/lesson-resources?${params}`, { headers });
    const data = await res.json();
    const resources = data.resources || data;

    if (!resources.length) {
      document.getElementById('lessonResourcesList').innerHTML = '<div class="empty-state"><p>No resources available yet</p></div>';
      return;
    }

    document.getElementById('lessonResourcesList').innerHTML = resources.map(r => `
      <div class="resource-card">
        <div class="resource-header">
          <h3>${r.title}</h3>
          <span class="badge ${r.type}">${r.type}</span>
        </div>
        <div class="resource-content">
          <pre>${r.content}</pre>
          ${r.zoom_link ? `<p><strong>Zoom Meeting:</strong> <a href="${r.zoom_link}" target="_blank" class="zoom-link">Join Meeting</a></p>` : ''}
        </div>
        <div class="resource-footer">
          <small>Added by ${r.user?.first_name || 'Instructor'} on ${new Date(r.created_at).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load lesson resources error:', err);
    document.getElementById('lessonResourcesList').innerHTML = '<p class="error">Failed to load resources</p>';
  }
}

// Init
loadMyCourses();
loadCourseResources();
loadLessonResources();

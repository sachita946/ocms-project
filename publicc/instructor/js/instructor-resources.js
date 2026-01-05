// Instructor Resources Management
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

// Toggle zoom link field for course resources
document.getElementById('courseResourceType').addEventListener('change', (e) => {
  const zoomGroup = document.getElementById('zoomLinkGroup');
  if (e.target.value === 'zoom') {
    zoomGroup.style.display = 'block';
    document.getElementById('courseZoomLink').required = true;
  } else {
    zoomGroup.style.display = 'none';
    document.getElementById('courseZoomLink').required = false;
  }
});

// Toggle zoom link field for lesson resources
document.getElementById('lessonResourceType').addEventListener('change', (e) => {
  const zoomGroup = document.getElementById('lessonZoomLinkGroup');
  if (e.target.value === 'zoom') {
    zoomGroup.style.display = 'block';
    document.getElementById('lessonZoomLink').required = true;
  } else {
    zoomGroup.style.display = 'none';
    document.getElementById('lessonZoomLink').required = false;
  }
});

// Load instructor courses
async function loadCourses() {
  try {
    const res = await fetch('/api/profile/me', { headers });
    const data = await res.json();
    const courses = data.courses || [];

    const options = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    document.getElementById('courseSelect').innerHTML = `<option value="">Select course</option>${options}`;
    document.getElementById('lessonCourseSelect').innerHTML = `<option value="">Select course</option>${options}`;
    document.getElementById('courseFilterSelect').innerHTML = `<option value="">All Courses</option>${options}`;
    document.getElementById('lessonFilterCourse').innerHTML = `<option value="">All Courses</option>${options}`;
  } catch (err) {
    console.error('Load courses error:', err);
    document.getElementById('courseSelect').innerHTML = '<option value="">Failed to load</option>';
  }
}

// Load lessons when course is selected
document.getElementById('lessonCourseSelect').addEventListener('change', async (e) => {
  const courseId = e.target.value;
  if (!courseId) {
    document.getElementById('lessonSelect').innerHTML = '<option value="">Select course first</option>';
    return;
  }

  try {
    const res = await fetch(`/api/lessons/course/${courseId}`, { headers });
    const lessons = await res.json();
    const options = lessons.map(l => `<option value="${l.id}">${l.title}</option>`).join('');
    document.getElementById('lessonSelect').innerHTML = `<option value="">Select lesson</option>${options}`;
  } catch (err) {
    console.error('Load lessons error:', err);
    document.getElementById('lessonSelect').innerHTML = '<option value="">Failed to load</option>';
  }
});

// Course Resource Form
document.getElementById('courseResourceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('courseResourceMsg');
  msg.textContent = '';

  const data = {
    course_id: parseInt(document.getElementById('courseSelect').value),
    type: document.getElementById('courseResourceType').value,
    title: document.getElementById('courseResourceTitle').value.trim(),
    content: document.getElementById('courseResourceContent').value.trim(),
    zoom_link: document.getElementById('courseZoomLink').value.trim() || null
  };

  if (!data.course_id || !data.type || !data.title || !data.content) {
    msg.textContent = 'All fields are required';
    msg.className = 'msg error';
    return;
  }

  if (data.type === 'zoom' && !data.zoom_link) {
    msg.textContent = 'Zoom link is required for Zoom meetings';
    msg.className = 'msg error';
    return;
  }

  try {
    const res = await fetch('/api/course-resources', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error(await res.text());

    msg.textContent = '✓ Resource added successfully!';
    msg.className = 'msg success';
    e.target.reset();
    document.getElementById('zoomLinkGroup').style.display = 'none';
    loadCourseResources();
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
    msg.className = 'msg error';
  }
});

// Lesson Resource Form
document.getElementById('lessonResourceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('lessonResourceMsg');
  msg.textContent = '';

  const data = {
    lesson_id: parseInt(document.getElementById('lessonSelect').value),
    type: document.getElementById('lessonResourceType').value,
    title: document.getElementById('lessonResourceTitle').value.trim(),
    content: document.getElementById('lessonResourceContent').value.trim(),
    zoom_link: document.getElementById('lessonZoomLink').value.trim() || null
  };

  if (!data.lesson_id || !data.type || !data.title || !data.content) {
    msg.textContent = 'All fields are required';
    msg.className = 'msg error';
    return;
  }

  if (data.type === 'zoom' && !data.zoom_link) {
    msg.textContent = 'Zoom link is required for Zoom meetings';
    msg.className = 'msg error';
    return;
  }

  try {
    const res = await fetch('/api/lesson-resources', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error(await res.text());

    msg.textContent = '✓ Resource added successfully!';
    msg.className = 'msg success';
    e.target.reset();
    document.getElementById('lessonZoomLinkGroup').style.display = 'none';
    loadLessonResources();
  } catch (err) {
    msg.textContent = `Error: ${err.message}`;
    msg.className = 'msg error';
  }
});

// Load Course Resources
async function loadCourseResources() {
  const courseId = document.getElementById('courseFilterSelect').value;
  const type = document.getElementById('courseFilterType').value;
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  if (type) params.append('type', type);

  try {
    const res = await fetch(`/api/course-resources?${params}`, { headers });
    const resources = await res.json();

    if (!resources.length) {
      document.getElementById('courseResourcesList').innerHTML = '<p>No resources found</p>';
      return;
    }

    document.getElementById('courseResourcesList').innerHTML = resources.map(r => `
      <div class="resource-card">
        <div class="resource-header">
          <h3>${r.title}</h3>
          <span class="badge ${r.type}">${r.type}</span>
        </div>
        <p>${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}</p>
        ${r.zoom_link ? `<p><strong>Zoom Link:</strong> <a href="${r.zoom_link}" target="_blank">${r.zoom_link}</a></p>` : ''}
        <div class="resource-meta">
          <small>Added: ${new Date(r.created_at).toLocaleDateString()}</small>
          <button class="btn sm ghost" onclick="deleteResource('course', ${r.id})">Delete</button>
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
  const lessonId = document.getElementById('lessonFilterLesson').value;
  const type = document.getElementById('lessonFilterType').value;
  const params = new URLSearchParams();
  if (lessonId) params.append('lesson_id', lessonId);
  if (type) params.append('type', type);

  try {
    const res = await fetch(`/api/lesson-resources?${params}`, { headers });
    const data = await res.json();
    const resources = data.resources || data;

    if (!resources.length) {
      document.getElementById('lessonResourcesList').innerHTML = '<p>No resources found</p>';
      return;
    }

    document.getElementById('lessonResourcesList').innerHTML = resources.map(r => `
      <div class="resource-card">
        <div class="resource-header">
          <h3>${r.title}</h3>
          <span class="badge ${r.type}">${r.type}</span>
        </div>
        <p>${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}</p>
        ${r.zoom_link ? `<p><strong>Zoom Link:</strong> <a href="${r.zoom_link}" target="_blank">${r.zoom_link}</a></p>` : ''}
        <div class="resource-meta">
          <small>Added: ${new Date(r.created_at).toLocaleDateString()}</small>
          <button class="btn sm ghost" onclick="deleteResource('lesson', ${r.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load lesson resources error:', err);
    document.getElementById('lessonResourcesList').innerHTML = '<p class="error">Failed to load resources</p>';
  }
}

// Delete Resource
async function deleteResource(type, id) {
  if (!confirm('Delete this resource?')) return;

  try {
    const endpoint = type === 'course' ? `/api/course-resources/${id}` : `/api/lesson-resources/${id}`;
    const res = await fetch(endpoint, { method: 'DELETE', headers });

    if (!res.ok) throw new Error(await res.text());

    if (type === 'course') loadCourseResources();
    else loadLessonResources();
  } catch (err) {
    alert(`Failed to delete: ${err.message}`);
  }
}

// Init
loadCourses();
loadCourseResources();
loadLessonResources();

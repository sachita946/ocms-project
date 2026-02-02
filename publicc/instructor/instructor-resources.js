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
  const fileGroup = document.getElementById('courseFileGroup');
  const contentField = document.getElementById('courseResourceContent');
  const fileField = document.getElementById('courseResourceFile');

  if (e.target.value === 'zoom') {
    zoomGroup.style.display = 'block';
    fileGroup.style.display = 'none';
    contentField.required = false;
    fileField.required = false;
    document.getElementById('courseZoomLink').required = true;
  } else if (['notes', 'questions', 'preboard', 'board'].includes(e.target.value)) {
    zoomGroup.style.display = 'none';
    fileGroup.style.display = 'block';
    contentField.required = false;
    fileField.required = true;
    document.getElementById('courseZoomLink').required = false;
  } else {
    zoomGroup.style.display = 'none';
    fileGroup.style.display = 'none';
    contentField.required = true;
    fileField.required = false;
    document.getElementById('courseZoomLink').required = false;
  }
});

// Toggle zoom link field for lesson resources
document.getElementById('lessonResourceType').addEventListener('change', (e) => {
  const zoomGroup = document.getElementById('lessonZoomLinkGroup');
  const fileGroup = document.getElementById('lessonFileGroup');
  const contentField = document.getElementById('lessonResourceContent');
  const fileField = document.getElementById('lessonResourceFile');

  if (e.target.value === 'zoom') {
    zoomGroup.style.display = 'block';
    fileGroup.style.display = 'none';
    contentField.required = false;
    fileField.required = false;
    document.getElementById('lessonZoomLink').required = true;
  } else if (['notes', 'questions', 'preboard'].includes(e.target.value)) {
    zoomGroup.style.display = 'none';
    fileGroup.style.display = 'block';
    contentField.required = false;
    fileField.required = true;
    document.getElementById('lessonZoomLink').required = false;
  } else {
    zoomGroup.style.display = 'none';
    fileGroup.style.display = 'none';
    contentField.required = true;
    fileField.required = false;
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

  const resourceType = document.getElementById('courseResourceType').value;
  const fileField = document.getElementById('courseResourceFile');
  const hasFile = fileField.files && fileField.files[0];

  // Prepare data based on resource type
  let data, headersToUse, body;

  if (resourceType === 'zoom') {
    // Zoom meetings only need text data
    data = {
      course_id: parseInt(document.getElementById('courseSelect').value),
      type: resourceType,
      title: document.getElementById('courseResourceTitle').value.trim(),
      zoom_link: document.getElementById('courseZoomLink').value.trim()
    };

    if (!data.course_id || !data.type || !data.title || !data.zoom_link) {
      msg.textContent = 'All fields are required';
      msg.className = 'msg error';
      return;
    }

    headersToUse = headers;
    body = JSON.stringify(data);
  } else if (['notes', 'questions', 'preboard', 'board'].includes(resourceType)) {
    // File-based resources need FormData
    if (!hasFile) {
      msg.textContent = 'Please select a file to upload';
      msg.className = 'msg error';
      return;
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (fileField.files[0].size > maxSize) {
      msg.textContent = 'File size too large. Maximum size is 500MB.';
      msg.className = 'msg error';
      return;
    }

    const courseId = parseInt(document.getElementById('courseSelect').value);
    const title = document.getElementById('courseResourceTitle').value.trim();

    if (!courseId || !resourceType || !title) {
      msg.textContent = 'Course, type, and title are required';
      msg.className = 'msg error';
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('course_id', courseId.toString());
    formData.append('type', resourceType);
    formData.append('title', title);
    formData.append('file', fileField.files[0]);

    headersToUse = { 'Authorization': `Bearer ${token}` }; // Remove Content-Type for FormData
    body = formData;
  } else {
    // Text-based resources
    data = {
      course_id: parseInt(document.getElementById('courseSelect').value),
      type: resourceType,
      title: document.getElementById('courseResourceTitle').value.trim(),
      content: document.getElementById('courseResourceContent').value.trim()
    };

    if (!data.course_id || !data.type || !data.title || !data.content) {
      msg.textContent = 'All fields are required';
      msg.className = 'msg error';
      return;
    }

    headersToUse = headers;
    body = JSON.stringify(data);
  }

  try {
    const res = await fetch('/api/course-resources', {
      method: 'POST',
      headers: headersToUse,
      body: body
    });

    if (!res.ok) throw new Error(await res.text());

    msg.textContent = '✓ Resource added successfully!';
    msg.className = 'msg success';
    e.target.reset();
    document.getElementById('zoomLinkGroup').style.display = 'none';
    document.getElementById('courseFileGroup').style.display = 'none';
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

  const resourceType = document.getElementById('lessonResourceType').value;
  const fileField = document.getElementById('lessonResourceFile');
  const hasFile = fileField.files && fileField.files[0];

  // Prepare data based on resource type
  let data, headersToUse, body;

  if (resourceType === 'zoom') {
    // Zoom meetings only need text data
    data = {
      lesson_id: parseInt(document.getElementById('lessonSelect').value),
      type: resourceType,
      title: document.getElementById('lessonResourceTitle').value.trim(),
      zoom_link: document.getElementById('lessonZoomLink').value.trim()
    };

    if (!data.lesson_id || !data.type || !data.title || !data.zoom_link) {
      msg.textContent = 'All fields are required';
      msg.className = 'msg error';
      return;
    }

    headersToUse = headers;
    body = JSON.stringify(data);
  } else if (['notes', 'questions', 'preboard'].includes(resourceType)) {
    // File-based resources need FormData
    if (!hasFile) {
      msg.textContent = 'Please select a file to upload';
      msg.className = 'msg error';
      return;
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (fileField.files[0].size > maxSize) {
      msg.textContent = 'File size too large. Maximum size is 500MB.';
      msg.className = 'msg error';
      return;
    }

    const lessonId = parseInt(document.getElementById('lessonSelect').value);
    const title = document.getElementById('lessonResourceTitle').value.trim();

    if (!lessonId || !resourceType || !title) {
      msg.textContent = 'Lesson, type, and title are required';
      msg.className = 'msg error';
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('lesson_id', lessonId.toString());
    formData.append('type', resourceType);
    formData.append('title', title);
    formData.append('file', fileField.files[0]);

    headersToUse = { 'Authorization': `Bearer ${token}` }; // Remove Content-Type for FormData
    body = formData;
  } else {
    // Text-based resources
    data = {
      lesson_id: parseInt(document.getElementById('lessonSelect').value),
      type: resourceType,
      title: document.getElementById('lessonResourceTitle').value.trim(),
      content: document.getElementById('lessonResourceContent').value.trim()
    };

    if (!data.lesson_id || !data.type || !data.title || !data.content) {
      msg.textContent = 'All fields are required';
      msg.className = 'msg error';
      return;
    }

    headersToUse = headers;
    body = JSON.stringify(data);
  }

  try {
    const res = await fetch('/api/lesson-resources', {
      method: 'POST',
      headers: headersToUse,
      body: body
    });

    if (!res.ok) throw new Error(await res.text());

    msg.textContent = '✓ Resource added successfully!';
    msg.className = 'msg success';
    e.target.reset();
    document.getElementById('lessonZoomLinkGroup').style.display = 'none';
    document.getElementById('lessonFileGroup').style.display = 'none';
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
        ${r.file_url ? `
          <p><strong>File:</strong> <a href="${r.file_url}" target="_blank" download>📎 Download ${r.file_type ? r.file_type.split('/')[1].toUpperCase() : 'File'}</a></p>
        ` : `
          <p>${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}</p>
        `}
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
        ${r.file_url ? `
          <p><strong>File:</strong> <a href="${r.file_url}" target="_blank" download>📎 Download ${r.file_type ? r.file_type.split('/')[1].toUpperCase() : 'File'}</a></p>
        ` : `
          <p>${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}</p>
        `}
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

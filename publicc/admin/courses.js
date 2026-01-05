// ============================================
// COURSES MANAGEMENT PAGE
// ============================================

initAdminPage();

const token = localStorage.getItem('ocms_token');
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
let allCourses = [];

// Load courses + setup resource panel on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  setupResourceHandlers();
});

// Navigation
document.querySelectorAll('[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});

// Load Courses
async function loadCourses() {
  try {
    const data = await fetchAPI('/api/admin/courses');
    if (!data) return;
    allCourses = data.courses || [];
    renderCourses(allCourses);
    populateCourseSelectors();
    loadCourseResources();
  } catch (err) {
    console.error(err);
  }
}

function populateCourseSelectors() {
  const courseOptions = allCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
  const select = document.getElementById('resourceCourseSelect');
  const filter = document.getElementById('resourceCourseFilter');
  if (select) select.innerHTML = `<option value="">Select course</option>${courseOptions}`;
  if (filter) filter.innerHTML = `<option value="">All courses</option>${courseOptions}`;
}

// Render Courses
function renderCourses(courses = []) {
  const list = document.getElementById('courses-list');
  const empty = document.getElementById('courses-empty');

  list.innerHTML = '';

  if (!courses.length) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'block';

  courses.forEach(course => {
    const instructor = course.instructor ? `${course.instructor.first_name} ${course.instructor.last_name}` : 'Unknown';
    const enrollments = (course._count?.enrollments || 0);
    const status = course.is_published ? '✓ Published' : 'Draft';
    const statusClass = course.is_published ? '' : 'draft';

    const card = `
      <div class="course-card">
        <div class="course-icon">📖</div>
        <div class="course-info">
          <h3>${course.title}</h3>
          <p><strong>Instructor:</strong> ${instructor}</p>
          <p><strong>Category:</strong> ${course.category || 'Uncategorized'}</p>
          <p><span class="badge-status ${statusClass}">${status}</span></p>
        </div>
        <div class="course-meta">
          <div class="meta-item">
            <strong>${enrollments}</strong>
            <span>Enrollments</span>
          </div>
          <div class="meta-item">
            <strong>${fmtCurrency(course.price)}</strong>
            <span>Price</span>
          </div>
          <button class="action-btn" onclick="editCourse('${course.id}')">Edit</button>
          <button class="action-btn action-btn-danger" onclick="deleteCourse('${course.id}')">Delete</button>
        </div>
      </div>
    `;
    list.innerHTML += card;
  });
}

// Filter Courses
function filterCourses() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allCourses.filter(course => {
    const title = course.title.toLowerCase();
    const instructor = `${course.instructor?.first_name || ''} ${course.instructor?.last_name || ''}`.toLowerCase();
    return title.includes(query) || instructor.includes(query);
  });
  renderCourses(filtered);
}

// Action handlers
function editCourse(courseId) {
  alert(`Edit course ${courseId} - Feature coming soon`);
}

function deleteCourse(courseId) {
  if (confirm('Are you sure you want to delete this course?')) {
    alert(`Delete course ${courseId} - Feature coming soon`);
  }
}

// ============================================
// Resource handling
// ============================================
function setupResourceHandlers() {
  const form = document.getElementById('resourceForm');
  if (form) {
    form.addEventListener('submit', submitCourseResource);
  }

  const courseFilter = document.getElementById('resourceCourseFilter');
  const typeFilter = document.getElementById('resourceTypeFilter');
  if (courseFilter) courseFilter.addEventListener('change', loadCourseResources);
  if (typeFilter) typeFilter.addEventListener('change', loadCourseResources);
}

async function submitCourseResource(e) {
  e.preventDefault();
  const msg = document.getElementById('resourceMsg');
  if (msg) msg.textContent = '';

  const course_id = parseInt(document.getElementById('resourceCourseSelect').value);
  const type = document.getElementById('resourceTypeSelect').value;
  const title = document.getElementById('resourceTitle').value.trim();
  const content = document.getElementById('resourceContent').value.trim();

  if (!course_id || !type || !title || !content) {
    if (msg) msg.textContent = 'Please fill all fields first.';
    return;
  }

  try {
    const res = await fetch('/api/course-resources', {
      method: 'POST',
      headers,
      body: JSON.stringify({ course_id, type, title, content })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to add resource');
    }

    if (msg) msg.textContent = '✓ Resource added';
    e.target.reset();
    populateCourseSelectors();
    loadCourseResources();
  } catch (err) {
    console.error('Add resource error:', err);
    if (msg) msg.textContent = `Error: ${err.message}`;
  }
}

async function loadCourseResources() {
  const list = document.getElementById('resourceList');
  const empty = document.getElementById('resourceEmpty');
  if (!list) return;

  const courseId = document.getElementById('resourceCourseFilter')?.value;
  const type = document.getElementById('resourceTypeFilter')?.value;
  const params = new URLSearchParams();
  if (courseId) params.append('courseId', courseId);
  if (type) params.append('type', type);

  try {
    const res = await fetch(`/api/course-resources?${params.toString()}`, { headers });
    const resources = await res.json();

    if (!resources.length) {
      list.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';
    const courseMap = new Map(allCourses.map(c => [c.id, c.title]));

    list.innerHTML = resources.map(r => {
      const courseTitle = courseMap.get(r.course_id) || `Course #${r.course_id}`;
      const preview = r.content.length > 160 ? `${r.content.substring(0, 160)}...` : r.content;
      return `
        <div class="resource-card">
          <div class="resource-header">
            <h3>${r.title}</h3>
            <span class="badge ${r.type}">${r.type}</span>
          </div>
          <p>${preview}</p>
          <div class="resource-meta">
            <span>${courseTitle}</span>
            <span>${new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          <div class="resource-meta">
            <span>By ${r.user?.first_name || 'User'}</span>
            <button class="action-btn action-btn-danger" onclick="deleteCourseResource(${r.id})">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Load course resources error:', err);
    list.innerHTML = '<p class="error">Failed to load resources</p>';
    if (empty) empty.style.display = 'none';
  }
}

async function deleteCourseResource(id) {
  if (!confirm('Delete this resource?')) return;
  try {
    const res = await fetch(`/api/course-resources/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error('Failed to delete');
    loadCourseResources();
  } catch (err) {
    console.error('Delete resource error:', err);
    alert('Unable to delete resource.');
  }
}

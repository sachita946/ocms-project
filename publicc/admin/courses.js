// ============================================
// COURSES MANAGEMENT PAGE
// ============================================

initAdminPage();

const token = localStorage.getItem('ocms_token');
let allCourses = [];

// Load courses on page load
document.addEventListener('DOMContentLoaded', loadCourses);

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
  } catch (err) {
    console.error(err);
  }
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


initAdminPage();

const token = localStorage.getItem('ocms_token');
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
let allCourses = [];

// Load courses + setup resource panel on page load
document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  setupResourceHandlers();
  setupCurriculumHandlers();
});

// Navigation
document.querySelectorAll('[data-section]').forEach(btn => {
  // Only add navigation listener if button doesn't have onclick handler
  if (!btn.onclick && !btn.getAttribute('onclick')) {
    btn.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
});

// Load Courses
async function loadCourses() {
  try {
    const data = await fetchAPI('/api/admin/demo/courses');
    if (!data) return;
    allCourses = Array.isArray(data) ? data : (data.courses || []);
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
  
  // Populate existing resource selects
  if (select) select.innerHTML = `<option value="">Select course</option>${courseOptions}`;
  if (filter) filter.innerHTML = `<option value="">All courses</option>${courseOptions}`;
  
  // Populate curriculum management selects
  const curriculumSelects = ['notesCourseSelect', 'preboardCourseSelect', 'boardCourseSelect'];
  curriculumSelects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) select.innerHTML = `<option value="">Select course</option>${courseOptions}`;
  });
  
  // Populate bulk upload select
  const bulkSelect = document.getElementById('bulkCourseSelect');
  if (bulkSelect) bulkSelect.innerHTML = `<option value="">Select Course for Bulk Upload</option>${courseOptions}`;
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
          <button class="action-btn ${course.is_published ? 'action-btn-warning' : 'action-btn-success'}" onclick="togglePublish('${course.id}', ${course.is_published})">${course.is_published ? 'Unpublish' : 'Publish'}</button>
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

async function togglePublish(courseId, currentStatus) {
  try {
    const newStatus = !currentStatus;
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({ is_published: newStatus })
    });

    if (response.ok) {
      // Update the course in our local array
      const course = allCourses.find(c => c.id === courseId);
      if (course) {
        course.is_published = newStatus;
        renderCourses(allCourses);
      }
      alert(`Course ${newStatus ? 'published' : 'unpublished'} successfully!`);
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Failed to update course status'}`);
    }
  } catch (error) {
    console.error('Error toggling publish status:', error);
    alert('Network error. Please try again.');
  }
}

// Resource handling
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

// Curriculum management handlers
function setupCurriculumHandlers() {
  // Add event listeners to curriculum forms
  document.querySelectorAll('.quick-resource-form').forEach(form => {
    form.addEventListener('submit', (e) => submitCurriculumResource(e, form.dataset.type));
  });
}

async function submitCurriculumResource(e, type) {
  e.preventDefault();
  const msg = document.getElementById('curriculumMsg');
  if (msg) msg.textContent = '';

  const courseSelect = document.getElementById(`${type}CourseSelect`);
  const titleInput = document.getElementById(`${type}Title`);
  const contentTextarea = document.getElementById(`${type}Content`);
  const fileInput = document.getElementById(`${type}File`);

  const course_id = parseInt(courseSelect.value);
  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();
  const file = fileInput.files[0];

  if (!course_id || !title) {
    if (msg) msg.textContent = 'Please fill all required fields.';
    return;
  }

  // For curriculum resources, either content or file must be provided
  if (!content && !file) {
    if (msg) msg.textContent = 'Please provide either content or upload a file.';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('course_id', course_id);
    formData.append('type', type);
    formData.append('title', title);
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    const res = await fetch('/api/course-resources', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData
      },
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to add ${type} resource`);
    }

    // Success
    if (msg) msg.textContent = `✓ ${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`;
    
    // Reset form
    e.target.reset();
    
    // Reload resources to show the new one
    loadCourseResources();

  } catch (error) {
    console.error(`Error adding ${type} resource:`, error);
    if (msg) msg.textContent = `❌ Failed to add ${type} resource: ${error.message}`;
  }
}

// Bulk upload resources
async function bulkUploadResources() {
  const courseSelect = document.getElementById('bulkCourseSelect');
  const fileInput = document.getElementById('bulkFiles');
  const msg = document.getElementById('curriculumMsg');
  
  const course_id = parseInt(courseSelect.value);
  const files = fileInput.files;
  
  if (!course_id) {
    if (msg) msg.textContent = 'Please select a course for bulk upload.';
    return;
  }
  
  if (!files || files.length === 0) {
    if (msg) msg.textContent = 'Please select files to upload.';
    return;
  }
  
  if (msg) msg.textContent = `Uploading ${files.length} files...`;
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name.toLowerCase();
    
    // Determine type based on filename
    let type = 'notes'; // default
    let title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    
    if (fileName.includes('preboard') || fileName.includes('pre_board') || fileName.includes('pre-board')) {
      type = 'preboard';
    } else if (fileName.includes('board') && !fileName.includes('preboard')) {
      type = 'board';
    }
    
    // Clean up title
    title = title.replace(/_/g, ' ').replace(/-/g, ' ');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    try {
      const formData = new FormData();
      formData.append('course_id', course_id);
      formData.append('type', type);
      formData.append('title', title);
      formData.append('file', file);
      
      const res = await fetch('/api/course-resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        successCount++;
      } else {
        errorCount++;
        console.error(`Failed to upload ${file.name}:`, await res.text());
      }
    } catch (error) {
      errorCount++;
      console.error(`Error uploading ${file.name}:`, error);
    }
  }
  
  // Update message
  if (msg) {
    if (errorCount === 0) {
      msg.textContent = `✓ Successfully uploaded ${successCount} files!`;
    } else {
      msg.textContent = `⚠️ Uploaded ${successCount} files, ${errorCount} failed. Check console for details.`;
    }
  }
  
  // Reset form and reload resources
  fileInput.value = '';
  loadCourseResources();
}

async function submitCourseResource(e) {
  e.preventDefault();
  const msg = document.getElementById('resourceMsg');
  if (msg) msg.textContent = '';

  const course_id = parseInt(document.getElementById('resourceCourseSelect').value);
  const type = document.getElementById('resourceTypeSelect').value;
  const title = document.getElementById('resourceTitle').value.trim();
  const content = document.getElementById('resourceContent').value.trim();
  const fileInput = document.getElementById('resourceFile');
  const file = fileInput.files[0];

  if (!course_id || !type || !title) {
    if (msg) msg.textContent = 'Please fill all required fields first.';
    return;
  }

  // For file-based resources, either content or file must be provided
  if ((type === 'notes' || type === 'preboard' || type === 'board') && !content && !file) {
    if (msg) msg.textContent = 'Please provide either content or upload a file.';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('course_id', course_id);
    formData.append('type', type);
    formData.append('title', title);
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    const res = await fetch('/api/course-resources', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData
      },
      body: formData
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
      const preview = r.content ? (r.content.length > 160 ? `${r.content.substring(0, 160)}...` : r.content) : 'File attachment only';
      const fileInfo = r.file_url ? `<br><small style="color: #4ade80;">📎 File: ${r.file_type || 'Unknown'} - <a href="${r.file_url}" target="_blank" style="color: #22c55e;">View/Download</a></small>` : '';
      return `
        <div class="resource-card">
          <div class="resource-header">
            <h3>${r.title}</h3>
            <span class="badge ${r.type}">${r.type}</span>
          </div>
          <p>${preview}${fileInfo}</p>
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

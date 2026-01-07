// Admin Course Resources Management
const API_URL = '/api';

let allCourses = [];
let currentCourseId = null;
let currentType = 'notes';
let resourcesList = [];

const typeIcons = {
  'notes': '📝',
  'questions': '❓',
  'preboard': '🎯'
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'ADMIN') {
    alert('Admin access required');
    window.location.href = '../auth/login.html';
    return;
  }

  await loadAllCourses();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('filterProgram').addEventListener('change', filterCoursesByProgram);
  document.getElementById('filterSemester').addEventListener('change', filterCoursesByProgram);
  document.getElementById('addResourceForm').addEventListener('submit', handleAddResource);
}

// Load all courses
async function loadAllCourses() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      allCourses = await response.json();
      filterCoursesByProgram();
    }
  } catch (error) {
    console.error('Error loading courses:', error);
  }
}

// Filter courses by program and semester
function filterCoursesByProgram() {
  const program = document.getElementById('filterProgram').value;
  const semester = document.getElementById('filterSemester').value;
  const courseSelect = document.getElementById('filterCourse');

  let filtered = allCourses;

  if (program) {
    filtered = filtered.filter(c => c.program === program);
  }

  if (semester) {
    filtered = filtered.filter(c => c.semester === parseInt(semester));
  }

  courseSelect.innerHTML = '<option value="">Select a course...</option>';
  filtered.forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = `${course.title} (${course.program} - Sem ${course.semester})`;
    courseSelect.appendChild(option);
  });
}

// Load resources
async function loadResources() {
  const courseId = document.getElementById('filterCourse').value;
  const type = document.getElementById('filterType').value;

  if (!courseId) {
    alert('Please select a course first');
    return;
  }

  currentCourseId = parseInt(courseId);
  currentType = type;

  const token = localStorage.getItem('token');
  const container = document.getElementById('resourcesList');

  container.innerHTML = '<div class="loading"><span class="spinner"></span><span>Loading...</span></div>';

  try {
    const response = await fetch(
      `${API_URL}/course-resources?courseId=${courseId}&type=${type}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (response.ok) {
      resourcesList = await response.json();

      if (resourcesList.length > 0) {
        displayResources();
      } else {
        showEmptyState();
      }
    } else {
      showEmptyState('Failed to load resources');
    }
  } catch (error) {
    console.error('Error loading resources:', error);
    showEmptyState('Error loading resources');
  }
}

// Display resources
function displayResources() {
  const container = document.getElementById('resourcesList');

  container.innerHTML = resourcesList.map(resource => `
    <div class="resource-item">
      <div class="resource-header">
        <div class="resource-title">${escapeHtml(resource.title)}</div>
        <div class="resource-date">${formatDate(resource.created_at)}</div>
      </div>
      <div class="resource-content">
        ${escapeHtml(resource.content).substring(0, 200)}${resource.content.length > 200 ? '...' : ''}
      </div>
      <div class="resource-footer">
        <button class="btn btn-small btn-view" onclick="viewResource(${resource.id})">
          👁️ View Full
        </button>
        <button class="btn btn-small btn-delete" onclick="deleteResource(${resource.id})">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

// Show empty state
function showEmptyState(message = 'No resources found. Add one below!') {
  document.getElementById('resourcesList').innerHTML = `
    <div class="empty-state">
      <div class="icon">📭</div>
      <h3>No Resources</h3>
      <p>${message}</p>
    </div>
  `;
}

// Handle add resource
async function handleAddResource(e) {
  e.preventDefault();

  if (!currentCourseId) {
    alert('Please select a course first');
    return;
  }

  const token = localStorage.getItem('token');
  const title = document.getElementById('resourceTitle').value.trim();
  const content = document.getElementById('resourceContent').value.trim();

  if (!title || !content) {
    alert('Please fill in all fields');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Adding...';

  try {
    const response = await fetch(`${API_URL}/course-resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        course_id: currentCourseId,
        type: currentType,
        title,
        content
      })
    });

    if (response.ok) {
      alert('✅ Resource added successfully!');
      document.getElementById('addResourceForm').reset();
      await loadResources();
    } else {
      const error = await response.json();
      alert('Error: ' + (error.message || 'Failed to add resource'));
    }
  } catch (error) {
    console.error('Error adding resource:', error);
    alert('Failed to add resource. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 Add Resource';
  }
}

// View full resource
function viewResource(resourceId) {
  const resource = resourcesList.find(r => r.id === resourceId);
  if (!resource) return;

  const modal = window.open('', '_blank', 'width=800,height=600');
  modal.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(resource.title)}</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
          color: #ff6b6b;
          margin-top: 0;
        }
        .meta {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        .content {
          color: #333;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${escapeHtml(resource.title)}</h1>
        <div class="meta">
          Created on ${formatDate(resource.created_at)}
        </div>
        <div class="content">${escapeHtml(resource.content)}</div>
      </div>
    </body>
    </html>
  `);
  modal.document.close();
}

// Delete resource
async function deleteResource(resourceId) {
  if (!confirm('Are you sure you want to delete this resource?')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/course-resources/${resourceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      alert('✅ Resource deleted successfully!');
      await loadResources();
    } else {
      alert('Failed to delete resource');
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    alert('Failed to delete resource. Please try again.');
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

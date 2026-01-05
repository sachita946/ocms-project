// Course Resources Page
const API_URL = 'http://localhost:5000/api';

let currentCourseId = 0;
let currentCourseName = '';
let currentType = '';
let resourcesList = [];

// Type to icon mapping
const typeIcons = {
  'notes': '📝',
  'preboard': '🎯',
  'board': '🏁'
};

const typeLabels = {
  'notes': 'Notes',
  'preboard': 'Preboard Questions',
  'board': 'Board Questions'
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentCourseId = parseInt(urlParams.get('courseId') || '0');
  currentCourseName = urlParams.get('courseName') || 'Course';
  currentType = urlParams.get('type') || 'notes';

  // Update page title
  updatePageTitle();

  // Load resources
  loadResources();
});

// Update page title and subtitle
function updatePageTitle() {
  const icon = typeIcons[currentType] || '📝';
  const label = typeLabels[currentType] || 'Notes';

  document.getElementById('pageTitle').textContent = `${icon} ${label}`;
  document.getElementById('pageSubtitle').textContent = `${decodeURIComponent(currentCourseName)}`;
}

// Load resources from backend
async function loadResources() {
  const token = localStorage.getItem('token');

  if (!token) {
    showEmptyState('Please login to view resources', '🔐');
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/course-resources?courseId=${currentCourseId}&type=${currentType}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        showEmptyState('No resources yet. Be the first to add one!', '📚');
        return;
      }
      throw new Error('Failed to load resources');
    }

    resourcesList = await response.json();

    if (Array.isArray(resourcesList) && resourcesList.length > 0) {
      displayResources();
    } else {
      showEmptyState('No resources yet. Be the first to add one!', '📚');
    }
  } catch (error) {
    console.error('Error loading resources:', error);
    showEmptyState('Failed to load resources. Please try again.', '❌');
  }
}

// Display resources
function displayResources() {
  const container = document.getElementById('resourcesList');
  
  container.innerHTML = resourcesList.map(resource => `
    <div class="resource-item">
      <div class="resource-item-header">
        <div class="resource-item-title">${escapeHtml(resource.title)}</div>
        <div class="resource-item-date">${formatDate(resource.created_at)}</div>
      </div>
      
      <div class="resource-item-content">
        ${escapeHtml(resource.content).substring(0, 200)}${resource.content.length > 200 ? '...' : ''}
      </div>

      <div class="resource-item-footer">
        <button class="btn-small btn-view" onclick="viewResource(${resource.id})">
          👁️ View
        </button>
      </div>
    </div>
  `).join('');
}

// Show empty state
function showEmptyState(message, icon = '📭') {
  document.getElementById('resourcesList').innerHTML = `
    <div class="empty-state">
      <div class="icon">${icon}</div>
      <h3>No Resources</h3>
      <p>${message}</p>
    </div>
  `;
}

// View full resource
function viewResource(resourceId) {
  const resource = resourcesList.find(r => r.id === resourceId);
  if (!resource) return;

  // Create a modal or open a new page
  const modal = window.open('', '_blank', 'width=800,height=600');
  modal.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(resource.title)}</title>
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', sans-serif;
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
          color: #667eea;
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
  if (!token) {
    alert('Please login to delete resources');
    return;
  }

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

// Check if current user is the owner of the resource
function isOwner(resource) {
  const userId = localStorage.getItem('userId');
  return resource.user_id === parseInt(userId) || resource.user_id === userId;
}

// Format date
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

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

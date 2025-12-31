// ============================================
// ADMIN - STUDENT PROGRESS JAVASCRIPT
// ============================================

// Check Auth
const token = checkAuth();

// DOM Elements
const $ = (id) => document.getElementById(id);
const totalEnrollments = $('totalEnrollments');
const avgProgress = $('avgProgress');
const completedCourses = $('completedCourses');
const activeStudents = $('activeStudents');
const loadingState = $('loadingState');
const tableContainer = $('tableContainer');
const emptyState = $('emptyState');
const searchBox = $('searchBox');

let allProgressData = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupLogout();
  setupFilters();
  loadProgressData();
});

// Setup Filter Buttons
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderTable(filterData());
    });
  });

  // Search functionality
  searchBox.addEventListener('input', () => {
    renderTable(filterData());
  });
}

// Load Progress Data
async function loadProgressData() {
  try {
    loadingState.style.display = 'block';
    tableContainer.style.display = 'none';
    emptyState.style.display = 'none';

    const response = await fetch('/api/admin/student-progress', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load progress data');
    }

    const data = await response.json();
    allProgressData = data.students || [];
    
    // Update stats
    updateStats(data.stats || {});
    
    // Render table
    renderTable(allProgressData);
    
    loadingState.style.display = 'none';
  } catch (error) {
    console.error('Error loading progress:', error);
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
  }
}

// Update Statistics
function updateStats(stats) {
  totalEnrollments.textContent = stats.totalEnrollments || 0;
  avgProgress.textContent = `${Math.round(stats.averageProgress || 0)}%`;
  completedCourses.textContent = stats.completedCourses || 0;
  activeStudents.textContent = stats.activeStudents || 0;
}

// Filter Data
function filterData() {
  let filtered = [...allProgressData];

  // Filter by status
  if (currentFilter !== 'all') {
    filtered = filtered.filter(item => item.status === currentFilter);
  }

  // Search filter
  const searchTerm = searchBox.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(item => 
      (item.studentName && item.studentName.toLowerCase().includes(searchTerm)) ||
      (item.studentEmail && item.studentEmail.toLowerCase().includes(searchTerm))
    );
  }

  return filtered;
}

// Render Table
function renderTable(data) {
  if (!data || data.length === 0) {
    tableContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  tableContainer.style.display = 'block';
  emptyState.style.display = 'none';

  const table = `
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Course</th>
          <th>Progress</th>
          <th>Completed Lessons</th>
          <th>Status</th>
          <th>Last Activity</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td>
              <div class="student-name">${item.studentName || 'Unknown'}</div>
              <div class="student-email">${item.studentEmail || ''}</div>
            </td>
            <td>${item.courseName || 'N/A'}</td>
            <td>
              <div class="progress-bar-mini">
                <div class="progress-fill" style="width: ${item.progress || 0}%"></div>
              </div>
              <div class="progress-label">${item.progress || 0}%</div>
            </td>
            <td>${item.completedLessons || 0} / ${item.totalLessons || 0}</td>
            <td>
              <span class="status-badge status-${(item.status || 'active').toLowerCase()}">
                ${item.status || 'ACTIVE'}
              </span>
            </td>
            <td>${item.lastActivity ? new Date(item.lastActivity).toLocaleDateString() : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  tableContainer.innerHTML = table;
}

// Export functions for reuse
window.loadProgressData = loadProgressData;

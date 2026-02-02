// Instructor Earnings Page
const API_URL = '/api';

let earningsData = [];
let chart = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  loadEarnings();
  initializeCharts();
});

// Load earnings data
async function loadEarnings() {
  const token = localStorage.getItem('token') || localStorage.getItem('ocms_token');

  if (!token) {
    window.location.href = '../auth/login.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/instructor-earnings/my-earnings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to load earnings');
    }

    const data = await response.json();
    earningsData = data.earnings;

    displayEarnings(data);
    updateCharts(data);

  } catch (error) {
    console.error('Error loading earnings:', error);
    showError('Failed to load earnings data');
  }
}

// Display earnings
function displayEarnings(data) {
  // Update summary cards
  document.getElementById('totalEarnings').textContent = data.summary.formatted_total_earnings;
  document.getElementById('pendingEarnings').textContent = data.summary.formatted_pending_earnings;
  document.getElementById('paidEarnings').textContent = data.summary.formatted_paid_earnings;
  document.getElementById('totalPayments').textContent = data.summary.total_payments;

  // Display earnings table
  const tbody = document.getElementById('earningsTableBody');
  tbody.innerHTML = data.earnings.map(earning => `
    <tr>
      <td>${formatDate(earning.created_at)}</td>
      <td>${escapeHtml(earning.course.title)}</td>
      <td>${earning.formatted_amount}</td>
      <td>${earning.formatted_platform_fee}</td>
      <td>${earning.formatted_net_amount}</td>
      <td>
        <span class="status-badge status-${earning.status.toLowerCase()}">
          ${earning.status}
        </span>
      </td>
    </tr>
  `).join('');
}

// Initialize charts
function initializeCharts() {
  const ctx = document.getElementById('earningsChart').getContext('2d');

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Monthly Earnings (NPR)',
        data: [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'NPR ' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Update charts with data
function updateCharts(data) {
  if (!chart) return;

  // Group earnings by month
  const monthlyData = {};
  data.earnings.forEach(earning => {
    const date = new Date(earning.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        label: monthLabel,
        amount: 0
      };
    }
    monthlyData[monthKey].amount += earning.net_amount;
  });

  // Sort by date
  const sortedMonths = Object.keys(monthlyData).sort();
  const labels = sortedMonths.map(key => monthlyData[key].label);
  const amounts = sortedMonths.map(key => monthlyData[key].amount);

  chart.data.labels = labels;
  chart.data.datasets[0].data = amounts;
  chart.update();
}

// Load earnings by course
async function loadEarningsByCourse() {
  const token = localStorage.getItem('token') || localStorage.getItem('ocms_token');

  try {
    const response = await fetch(`${API_URL}/instructor-earnings/my-earnings/by-course`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to load course earnings');
    }

    const data = await response.json();
    displayCourseEarnings(data);

  } catch (error) {
    console.error('Error loading course earnings:', error);
  }
}

// Display earnings by course
function displayCourseEarnings(data) {
  const container = document.getElementById('courseEarningsContainer');
  container.innerHTML = data.course_earnings.map(courseData => `
    <div class="course-earning-card">
      <div class="course-earning-header">
        <h4>${escapeHtml(courseData.course.title)}</h4>
        <span class="course-earning-amount">${courseData.formatted_total_earnings}</span>
      </div>
      <div class="course-earning-details">
        <span>Category: ${escapeHtml(courseData.course.category || 'General')}</span>
        <span>Level: ${courseData.course.level}</span>
        <span>Payments: ${courseData.total_payments}</span>
      </div>
    </div>
  `).join('');
}

// Show error message
function showError(message) {
  const container = document.querySelector('.container');
  container.innerHTML = `
    <div class="error-state">
      <h2>⚠️ Error</h2>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn">Retry</button>
    </div>
  `;
}

// Format date
function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

// Tab switching
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Remove active class from all tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');

  // Load data for specific tabs
  if (tabName === 'courseEarnings') {
    loadEarningsByCourse();
  }
}
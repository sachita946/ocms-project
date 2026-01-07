initAdminPage();

const token = localStorage.getItem('ocms_token');
let allPayments = [];

// Load payments on page load
document.addEventListener('DOMContentLoaded', loadPayments);

// Navigation
document.querySelectorAll('[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});

// Status filter
document.getElementById('statusFilter')?.addEventListener('change', () => {
  renderPayments(allPayments); // Linear search will handle filtering
});

// Load Payments
async function loadPayments() {
  try {
    const data = await fetchAPI('/api/admin/payments');
    if (!data) return;
    allPayments = data.payments || [];
    renderPayments(allPayments);
  } catch (err) {
    console.error(err);
  }
}

// Render Payments Table (Single Linear Search Algorithm)
function renderPayments(payments = []) {
  const tbody = document.getElementById('payments-tbody');
  const empty = document.getElementById('payments-empty');
  const table = document.getElementById('payments-table');

  tbody.innerHTML = '';

  const filterStatus = document.getElementById('statusFilter')?.value;

  let found = false;

  // -------------------------------
  // SINGLE ALGORITHM: Linear Search
  // -------------------------------
  for (let i = 0; i < payments.length; i++) {
    const p = payments[i];

    // Apply status filter while looping
    if (filterStatus && p.status !== filterStatus) continue;

    found = true;

    const student = p.student ? `${p.student.first_name} ${p.student.last_name}` : 'Unknown';
    const course = p.course?.title || 'Unknown Course';
    const statusClass = p.status === 'COMPLETED' ? '' : p.status === 'PENDING' ? 'pending' : 'failed';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student}</td>
      <td>${course}</td>
      <td>${fmtCurrency(p.amount)}</td>
      <td>${p.payment_method || 'N/A'}</td>
      <td><span class="badge-status ${statusClass}">${p.status}</span></td>
      <td>${fmtDate(p.created_at)}</td>
      <td>
        <button class="action-btn" onclick="viewPayment('${p.id}')">View</button>
      </td>
    `;
    tbody.appendChild(row);
  }

  // Handle empty state
  if (!found) {
    table.style.display = 'none';
    empty.style.display = 'block';
  } else {
    table.style.display = 'table';
    empty.style.display = 'none';
  }
}

// Action handlers
function viewPayment(paymentId) {
  alert(`View payment ${paymentId} - Feature coming soon`);
}

// Helper functions
function fmtCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

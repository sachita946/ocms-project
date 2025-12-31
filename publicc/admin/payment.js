// ============================================
// PAYMENTS MANAGEMENT PAGE
// ============================================

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
document.addEventListener('DOMContentLoaded', () => {
  const filter = document.getElementById('statusFilter');
  if (filter) {
    filter.addEventListener('change', filterPayments);
  }
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

// Render Payments Table
function renderPayments(payments = []) {
  const tbody = document.getElementById('payments-tbody');
  const empty = document.getElementById('payments-empty');
  const table = document.getElementById('payments-table');

  tbody.innerHTML = '';

  if (!payments.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';

  payments.forEach(payment => {
    const student = payment.student ? `${payment.student.first_name} ${payment.student.last_name}` : 'Unknown';
    const course = payment.course?.title || 'Unknown Course';
    const statusClass = payment.status === 'COMPLETED' ? '' : payment.status === 'PENDING' ? 'pending' : 'failed';

    const row = `
      <tr>
        <td>${student}</td>
        <td>${course}</td>
        <td>${fmtCurrency(payment.amount)}</td>
        <td>${payment.payment_method || 'N/A'}</td>
        <td><span class="badge-status ${statusClass}">${payment.status}</span></td>
        <td>${fmtDate(payment.created_at)}</td>
        <td>
          <button class="action-btn" onclick="viewPayment('${payment.id}')">View</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Filter Payments
function filterPayments() {
  const status = document.getElementById('statusFilter').value;
  const filtered = status ? allPayments.filter(p => p.status === status) : allPayments;
  renderPayments(filtered);
}

// Action handlers
function viewPayment(paymentId) {
  alert(`View payment ${paymentId} - Feature coming soon`);
}

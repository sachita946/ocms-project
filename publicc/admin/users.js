// ============================================
// USERS MANAGEMENT PAGE
// ============================================

initAdminPage();

const token = localStorage.getItem('ocms_token');
let allUsers = [];

// Load users on page load
document.addEventListener('DOMContentLoaded', loadUsers);

// Navigation
document.querySelectorAll('[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});

// Load Users
async function loadUsers() {
  try {
    const data = await fetchAPI('/api/admin/users');
    if (!data) return;
    allUsers = data.users || [];
    renderUsers(allUsers);
  } catch (err) {
    console.error(err);
  }
}

// Render Users Table
function renderUsers(users = []) {
  const tbody = document.getElementById('users-tbody');
  const empty = document.getElementById('users-empty');
  const table = document.getElementById('users-table');

  tbody.innerHTML = '';

  if (!users.length) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';

  users.forEach(user => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
    const status = user.is_active ? '✓ Active' : '✗ Inactive';
    const statusClass = user.is_active ? 'badge-active' : 'badge-inactive';
    const profileInfo = user.studentProfile ? '👨‍🎓 Student' : user.instructorProfile ? '👨‍🏫 Instructor' : '—';

    const row = `
      <tr>
        <td>${name}</td>
        <td>${user.email}</td>
        <td><span class="badge-role">${user.role}</span></td>
        <td><span class="${statusClass}">${status}</span></td>
        <td>${fmtDate(user.created_at)}</td>
        <td>${profileInfo}</td>
        <td>
          <button class="action-btn" onclick="editUser('${user.id}')">Edit</button>
          <button class="action-btn action-btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Filter Users
function filterUsers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allUsers.filter(user => {
    const name = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const role = user.role.toLowerCase();
    return name.includes(query) || email.includes(query) || role.includes(query);
  });
  renderUsers(filtered);
}

// Action handlers
function editUser(userId) {
  alert(`Edit user ${userId} - Feature coming soon`);
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    alert(`Delete user ${userId} - Feature coming soon`);
  }
}


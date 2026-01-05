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
    
    // Check if instructor is pending approval
    const isPendingInstructor = user.role === 'INSTRUCTOR' && user.instructorProfile?.is_pending_approval;
    const instructorStatus = user.instructorProfile?.is_verified ? 'Verified' : 
                           user.instructorProfile?.is_pending_approval ? 'Pending Approval' : 'Not Verified';

    const row = `
      <tr>
        <td>${name}</td>
        <td>${user.email}</td>
        <td><span class="badge-role">${user.role}</span></td>
        <td><span class="${statusClass}">${status}</span></td>
        <td>${fmtDate(user.created_at)}</td>
        <td>${profileInfo} ${user.role === 'INSTRUCTOR' ? `<br><small style="color: #facc15;">${instructorStatus}</small>` : ''}</td>
        <td>
          ${isPendingInstructor ? `
            <button class="action-btn" onclick="approveInstructor('${user.id}')">✓ Approve</button>
            <button class="action-btn action-btn-danger" onclick="rejectInstructor('${user.id}')">✗ Reject</button>
          ` : `
            <button class="action-btn" onclick="editUser('${user.id}')">Edit</button>
            <button class="action-btn action-btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
          `}
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

// Approve instructor
async function approveInstructor(userId) {
  if (!confirm('Are you sure you want to approve this instructor?')) return;
  
  try {
    const response = await fetch(`/api/admin/instructors/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      alert('Instructor approved successfully!');
      loadUsers(); // Reload the users list
    } else {
      alert('Failed to approve instructor');
    }
  } catch (error) {
    console.error('Error approving instructor:', error);
    alert('Error approving instructor');
  }
}

// Reject instructor
async function rejectInstructor(userId) {
  if (!confirm('Are you sure you want to reject this instructor?')) return;
  
  try {
    const response = await fetch(`/api/admin/instructors/${userId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      alert('Instructor rejected successfully!');
      loadUsers(); // Reload the users list
    } else {
      alert('Failed to reject instructor');
    }
  } catch (error) {
    console.error('Error rejecting instructor:', error);
    alert('Error rejecting instructor');
  }
}


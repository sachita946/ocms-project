const apiBaseUrl = 'http://localhost:3000/api/profile/student';

// Check authentication
const token = localStorage.getItem('ocms_token') || localStorage.getItem('token');
const userRole = localStorage.getItem('user_role') || localStorage.getItem('role');

if (!token) {
  window.location.href = '../auth/login.html';
}

if (userRole !== 'STUDENT') {
  window.location.href = '../auth/login.html';
}

// Helper function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}

document.addEventListener('DOMContentLoaded', async ()=>{
  try {
    // Fetch user profile and dashboard data
    const profileRes = await authenticatedFetch('http://localhost:3000/api/profile/me');
    if (profileRes.status === 401) {
      window.location.href = '../auth/login.html';
      return;
    }
    const profileData = await profileRes.json();

    // Update profile information
    document.getElementById('profile-picture').src = profileData.user.profile_picture || '/default.png';
    document.getElementById('full-name').textContent = profileData.user.first_name + ' ' + profileData.user.last_name;
    document.getElementById('email').textContent = profileData.user.email;
    document.getElementById('bio').textContent = profileData.user.bio || '';

    // Update dashboard information
    const dashboardData = profileData.dashboard;

    const enrollmentsEl = document.getElementById('enrollments-list');
    if (dashboardData.enrollments) {
      dashboardData.enrollments.forEach(e=>{
        const li=document.createElement('li');
        li.textContent=`${e.course.title} (${e.completion_status})`;
        enrollmentsEl.appendChild(li);
      });
    }

    // Create progress chart if data exists
    if (dashboardData.progressData && dashboardData.progressData.length > 0) {
      const ctx=document.getElementById('progress-chart').getContext('2d');
      new Chart(ctx,{
        type:'bar',
        data:{
          labels:dashboardData.progressData.map(d=>d.courseTitle),
          datasets:[{label:'Completion %', data:dashboardData.progressData.map(d=>d.percentage), backgroundColor:'#4caf50'}]
        },
        options:{ responsive:true, scales:{ y:{ beginAtZero:true, max:100 }}}
      });
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    window.location.href = '../auth/login.html';
  }
});

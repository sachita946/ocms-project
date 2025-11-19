const apiUrl = "http://localhost:3000/api/profile/instructor";
document.addEventListener('DOMContentLoaded', ()=>{
  fetch(`${apiUrl}/me`).then(res=>res.json()).then(data=>{
    document.getElementById('profile-picture').src=data.profile_picture||'/default.png';
    document.getElementById('full-name').textContent=data.full_name;
    document.getElementById('email').textContent=data.user.email;
    document.getElementById('bio').textContent=data.bio||'';
    document.getElementById('expertise').textContent=data.expertise_area||'';
    const coursesEl=document.getElementById('courses-list');
    data.user.courses_created.forEach(c=>{
      const li=document.createElement('li');
      li.textContent=`${c.title} - Enrolled: ${c.enrollments.length} - Revenue: $${c.payments.reduce((a,b)=>a+b.amount,0)} - Reviews: ${c.reviews.length}`;
      coursesEl.appendChild(li);
    });
        // Analytics charts
    const stats = data.user.courses_created.map(c => ({
      courseTitle: c.title,
      enrolled: c.enrollments.length,
      revenue: c.payments.reduce((acc, p) => acc + p.amount, 0)
    }));

    const labels = stats.map(s => s.courseTitle);
    const enrolledData = stats.map(s => s.enrolled);
    const revenueData = stats.map(s => s.revenue);

    // Enrollments chart
    const enrollCtx = document.getElementById('enrollments-chart').getContext('2d');
    new Chart(enrollCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Enrollments',
          data: enrolledData,
          backgroundColor: '#2196f3'
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    // Revenue chart
    const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue ($)',
          data: revenueData,
          backgroundColor: '#ff9800',
          borderColor: '#ff9800',
          fill: false,
          tension: 0.1
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  });
});

 

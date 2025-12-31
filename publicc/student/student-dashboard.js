const apiBaseUrl = '/api/profile/student';
document.addEventListener('DOMContentLoaded', ()=>{
  fetch(`${apiBaseUrl}/me`).then(res=>res.json()).then(data=>{
    document.getElementById('profile-picture').src=data.profile_picture||'/default.png';
    document.getElementById('full-name').textContent=data.full_name;
    document.getElementById('email').textContent=data.user.email;
    document.getElementById('bio').textContent=data.bio||'';
  });

  fetch('/api/profile/student/dashboard').then(res=>res.json()).then(data=>{
    const enrollmentsEl = document.getElementById('enrollments-list');
    data.enrollments.forEach(e=>{
      const li=document.createElement('li');
      li.textContent=`${e.course.title} (${e.completion_status})`;
      enrollmentsEl.appendChild(li);
    });

    const ctx=document.getElementById('progress-chart').getContext('2d');
    new Chart(ctx,{
      type:'bar',
      data:{
        labels:data.progressData.map(d=>d.courseTitle),
        datasets:[{label:'Completion %', data:data.progressData.map(d=>d.percentage), backgroundColor:'#4caf50'}]
      },
      options:{ responsive:true, scales:{ y:{ beginAtZero:true, max:100 }}}
    });
  });
});

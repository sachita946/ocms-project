const apiBaseUrl = 'http://localhost:3000/api/courses';
const coursesData = {
  BIM: {
    1: [
      {name:'Computer Fundamentals', reviews:45, stars:4, certificate:true},
      {name:'Mathematics I', reviews:32, stars:3, certificate:false},
      {name:'Business Communication', reviews:50, stars:5, certificate:true}
    ],
    2:[{name:'Programming Fundamentals', reviews:40, stars:4, certificate:true},{name:'Mathematics II', reviews:28, stars:3, certificate:false},{name:'Economics', reviews:36, stars:4, certificate:false}],
    3:[{name:'Database Management System', reviews:55, stars:5, certificate:true},{name:'Statistics', reviews:38, stars:4, certificate:false},{name:'Software Engineering', reviews:42, stars:4, certificate:true}],
    4:[{name:'Web Technologies', reviews:48, stars:4, certificate:true},{name:'Accounting', reviews:30, stars:3, certificate:false},{name:'Data Structures', reviews:50, stars:5, certificate:true}],
    5:[{name:'Object Oriented Programming', reviews:52, stars:5, certificate:true},{name:'Networking', reviews:40, stars:4, certificate:false},{name:'Marketing', reviews:35, stars:4, certificate:true}],
    6:[{name:'Artificial Intelligence', reviews:60, stars:5, certificate:true},{name:'Finance', reviews:32, stars:3, certificate:false},{name:'Operating Systems', reviews:45, stars:4, certificate:true}],
    7:[{name:'Project Management', reviews:50, stars:4, certificate:true},{name:'Big Data Analytics', reviews:38, stars:4, certificate:true},{name:'E-Commerce', reviews:42, stars:4, certificate:true}],
    8:[{name:'Capstone Project', reviews:65, stars:5, certificate:true},{name:'Cloud Computing', reviews:55, stars:5, certificate:true},{name:'Entrepreneurship', reviews:48, stars:4, certificate:false}]
  },
  CSIT: {
    1:[{name:'Computer Fundamentals', reviews:38, stars:4, certificate:true},{name:'Mathematics I', reviews:30, stars:3, certificate:false},{name:'Programming Basics', reviews:42, stars:5, certificate:true}],
    2:[{name:'Data Structures', reviews:45, stars:4, certificate:true},{name:'Discrete Mathematics', reviews:35, stars:3, certificate:false},{name:'C Programming', reviews:40, stars:4, certificate:true}],
    3:[{name:'Algorithms', reviews:50, stars:5, certificate:true},{name:'Database Systems', reviews:42, stars:4, certificate:true},{name:'Digital Logic', reviews:38, stars:4, certificate:false}],
    4:[{name:'Operating Systems', reviews:48, stars:4, certificate:true},{name:'Web Development', reviews:40, stars:4, certificate:true},{name:'Networking Basics', reviews:36, stars:3, certificate:false}],
    5:[{name:'Software Engineering', reviews:50, stars:5, certificate:true},{name:'Artificial Intelligence', reviews:55, stars:5, certificate:true},{name:'Java Programming', reviews:45, stars:4, certificate:true}],
    6:[{name:'Machine Learning', reviews:60, stars:5, certificate:true},{name:'Cyber Security', reviews:42, stars:4, certificate:true},{name:'Cloud Computing', reviews:50, stars:4, certificate:true}],
    7:[{name:'Big Data Analytics', reviews:55, stars:5, certificate:true},{name:'Mobile App Development', reviews:48, stars:4, certificate:true},{name:'Project Management', reviews:45, stars:4, certificate:true}],
    8:[{name:'Final Year Project', reviews:65, stars:5, certificate:true},{name:'Deep Learning', reviews:60, stars:5, certificate:true},{name:'Entrepreneurship', reviews:50, stars:4, certificate:true}]
  },
  BCA: {
    1:[{name:'Introduction to Computers', reviews:25, stars:4, certificate:true},{name:'Mathematics I', reviews:20, stars:3, certificate:false},{name:'English Communication', reviews:30, stars:4, certificate:true}],
    2:[{name:'Programming in C', reviews:35, stars:4, certificate:true},{name:'Mathematics II', reviews:25, stars:3, certificate:false},{name:'Fundamentals of IT', reviews:32, stars:4, certificate:true}],
    3:[{name:'Data Structures', reviews:40, stars:4, certificate:true},{name:'Database Management', reviews:38, stars:4, certificate:true},{name:'Computer Architecture', reviews:35, stars:3, certificate:false}],
    4:[{name:'Web Development', reviews:45, stars:5, certificate:true},{name:'Operating Systems', reviews:40, stars:4, certificate:true},{name:'Networking Basics', reviews:38, stars:4, certificate:false}],
    5:[{name:'Java Programming', reviews:50, stars:5, certificate:true},{name:'Software Engineering', reviews:48, stars:4, certificate:true},{name:'Cyber Security', reviews:45, stars:4, certificate:true}],
    6:[{name:'Python Programming', reviews:55, stars:5, certificate:true},{name:'Machine Learning', reviews:52, stars:5, certificate:true},{name:'Data Analytics', reviews:48, stars:4, certificate:true}],
    7:[{name:'Mobile App Development', reviews:50, stars:4, certificate:true},{name:'Project Management', reviews:48, stars:4, certificate:true},{name:'Cloud Computing', reviews:45, stars:4, certificate:true}],
    8:[{name:'Final Project', reviews:60, stars:5, certificate:true},{name:'AI & Deep Learning', reviews:55, stars:5, certificate:true},{name:'Entrepreneurship', reviews:50, stars:4, certificate:true}]
  }
};
function renderCourses(program, semester) {
  const container = document.getElementById(`${program}-courses`);
  container.innerHTML = '';
  const courses = coursesData[program][semester];
  courses.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <h3>${course.name}</h3>
      <div class="reviews">${'★'.repeat(course.stars)}${'☆'.repeat(5-course.stars)} (${course.reviews} reviews)</div>
      <p>Learn the fundamentals and advanced concepts of ${course.name}.</p>
      ${course.certificate ? `<div class="certificate">🎓 Certificate</div>` : ''}
      <button class="enroll-btn">Enroll Now</button>
    `;
    container.appendChild(card);
  });
}

// Event listeners for semester buttons
document.querySelectorAll('.semester-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const section = btn.closest('section');
    const program = section.querySelector('.program-btn.active').dataset.program;
    const container = document.getElementById(`${program}-courses`);
    
    // Toggle container visibility
    if (!container.classList.contains('hidden') && btn.classList.contains('active')) {
      container.classList.add('hidden'); 
      btn.classList.remove('active');
    } else {
      // Remove active from other semesters
      section.querySelectorAll('.semester-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderCourses(program, btn.dataset.sem);
      container.classList.remove('hidden'); 
    }
  });
});

// Program switch hides courses
document.querySelectorAll('.program-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const section = btn.closest('section');
    section.querySelector('.courses-container').classList.add('hidden');
    section.querySelectorAll('.program-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

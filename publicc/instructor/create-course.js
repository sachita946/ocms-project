const apiBaseUrl = 'http://localhost:3000/api/courses';
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createCourseForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('courseTitle');
    const desc = document.getElementById('courseDescription');
    const url = document.getElementById('courseURL');

    const titleError = document.getElementById('courseTitleError');
    const descError = document.getElementById('courseDescriptionError');
    const urlError = document.getElementById('courseURLError');
    const msg = document.getElementById('courseMsg');

    titleError.textContent = descError.textContent = urlError.textContent = msg.textContent = '';

    let valid = true;
    if(!title.value){ titleError.textContent="Required"; valid=false; }
    if(!desc.value){ descError.textContent="Required"; valid=false; }
    if(!url.value || !/^https?:\/\/\S+\.\S+$/.test(url.value)){ urlError.textContent="Invalid URL"; valid=false; }

    if(!valid) return;
    msg.textContent="Course created successfully!";
    msg.style.color="green";
    form.reset();
  });
});

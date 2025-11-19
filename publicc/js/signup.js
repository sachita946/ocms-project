const apiBaseUrl = 'http://localhost:3000/api/signup';
document.addEventListener('DOMContentLoaded', () => {
  const studentBtn = document.getElementById('studentBtn');
  const instructorBtn = document.getElementById('instructorBtn');
  const studentForm = document.getElementById('studentForm');
  const instructorForm = document.getElementById('instructorForm');

  studentBtn.addEventListener('click', () => {
    studentBtn.classList.add('active');
    instructorBtn.classList.remove('active');
    studentForm.style.display = 'block';
    instructorForm.style.display = 'none';
  });
  instructorBtn.addEventListener('click', () => {
    instructorBtn.classList.add('active');
    studentBtn.classList.remove('active');
    instructorForm.style.display = 'block';
    studentForm.style.display = 'none';
  });
  // Back to login buttons
document.getElementById('backToLogin1').addEventListener('click', () => {
  window.location.href = 'login.html';
});

document.getElementById('backToLogin2').addEventListener('click', () => {
  window.location.href = 'login.html';
});

  // Student form validation
  studentForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('studentName');
    const email = document.getElementById('studentEmail');
    const password = document.getElementById('studentPassword');
    const bio = document.getElementById('studentBio');
    const nameError = document.getElementById('studentNameError');
    const emailError = document.getElementById('studentEmailError');
    const passwordError = document.getElementById('studentPasswordError');
    const bioError = document.getElementById('studentBioError');
    const msg = document.getElementById('studentMsg');

    nameError.textContent = emailError.textContent = passwordError.textContent = bioError.textContent = msg.textContent = '';

    let valid = true;
    if(!name.value || /\d/.test(name.value)) { nameError.textContent="Invalid name"; valid=false; }
    if(!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailError.textContent="Invalid email"; valid=false; }
    if(!password.value || password.value.length<6){ passwordError.textContent="Password min 6 chars"; valid=false; }
    if(!bio.value){ bioError.textContent="Required"; valid=false; }
    if(!valid) return;

    msg.textContent="Account created successfully!";
    msg.style.color="green";
    setTimeout(()=>{ window.location.href="login.html"; }, 1000);
  });

  // Instructor form validation
  instructorForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('instructorName');
    const email = document.getElementById('instructorEmail');
    const password = document.getElementById('instructorPassword');
    const expertise = document.getElementById('instructorExpertise');
    const portfolio = document.getElementById('instructorPortfolio');
    const bio = document.getElementById('instructorBio');

    const nameError = document.getElementById('instructorNameError');
    const emailError = document.getElementById('instructorEmailError');
    const passwordError = document.getElementById('instructorPasswordError');
    const expertiseError = document.getElementById('instructorExpertiseError');
    const portfolioError = document.getElementById('instructorPortfolioError');
    const bioError = document.getElementById('instructorBioError');
    const msg = document.getElementById('instructorMsg');

    nameError.textContent = emailError.textContent = passwordError.textContent = expertiseError.textContent = portfolioError.textContent = bioError.textContent = msg.textContent = '';

    let valid = true;
    if(!name.value || /\d/.test(name.value)) { nameError.textContent="Invalid name"; valid=false; }
    if(!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { emailError.textContent="Invalid email"; valid=false; }
    if(!password.value || password.value.length<6){ passwordError.textContent="Password min 6 chars"; valid=false; }
    if(!expertise.value){ expertiseError.textContent="Required"; valid=false; }
    if(portfolio.value && !/^https?:\/\/\S+\.\S+$/.test(portfolio.value)){ portfolioError.textContent="Invalid URL"; valid=false; }
    if(!bio.value){ bioError.textContent="Required"; valid=false; }
    if(!valid) return;

    msg.textContent="Account created successfully!";
    msg.style.color="green";
    setTimeout(()=>{ window.location.href="login.html"; }, 1000);
  });
});
// document.addEventListener('DOMContentLoaded',()=>{

//   const studentBtn=document.getElementById('studentBtn');
//   const instructorBtn=document.getElementById('instructorBtn');
//   const studentForm=document.getElementById('studentForm');
//   const instructorForm=document.getElementById('instructorForm');

//   function toggleRole(role){
//     if(role==='student'){
//       studentBtn.classList.add('active');
//       instructorBtn.classList.remove('active');
//       studentForm.style.display='block';
//       instructorForm.style.display='none';
//     } else {
//       instructorBtn.classList.add('active');
//       studentBtn.classList.remove('active');
//       instructorForm.style.display='block';
//       studentForm.style.display='none';
//     }
//   }

//   studentBtn.addEventListener('click',()=>toggleRole('student'));
//   instructorBtn.addEventListener('click',()=>toggleRole('instructor'));

//   const backBtns=document.querySelectorAll('.back-btn');
//   backBtns.forEach(btn=>btn.addEventListener('click',()=>{
//     window.location.href='login.html';
//   }));

//   // Validators
//   function isValidName(name){ return /^[A-Za-z\s]+$/.test(name.trim()); }
//   function isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && !/^\d+$/.test(email.split('@')[0]); }
//   function isValidURL(url){ return !url.trim() || /^(https?:\/\/)[^\s]+$/.test(url.trim()); }

//   function handleForm(form, fields){
//     form.addEventListener('submit',e=>{
//       e.preventDefault();
//       let valid=true;
//       fields.forEach(f=>f.error.textContent='');

//       fields.forEach(f=>{
//         const val=f.input.value.trim();
//         if(f.required && !val){ f.error.textContent=`${f.label} is required`; valid=false;}
//         else if(f.type==='name' && !isValidName(val)){ f.error.textContent=`${f.label} must contain letters only`; valid=false;}
//         else if(f.type==='email' && !isValidEmail(val)){ f.error.textContent='Invalid email format'; valid=false;}
//         else if(f.type==='url' && !isValidURL(val)){ f.error.textContent='Invalid URL'; valid=false;}
//         else if(f.type==='confirm' && val!==f.confirmWith.value){ f.error.textContent='Passwords do not match'; valid=false;}
//         else if(f.type==='password' && val.length<6){ f.error.textContent='Password must be at least 6 chars'; valid=false;}
//       });

//       if(valid){
//         form.querySelector('.form-msg').textContent='Account created successfully!';
//         form.querySelector('.form-msg').style.color='green';
//         setTimeout(()=>window.location.href='login.html',1500);
//       }
//     });
//   }

//   handleForm(studentForm,[
//     {input: document.getElementById('studentName'), error: document.getElementById('studentNameError'), label:'Name', type:'name', required:true},
//     {input: document.getElementById('studentEmail'), error: document.getElementById('studentEmailError'), label:'Email', type:'email', required:true},
//     {input: document.getElementById('studentPassword'), error: document.getElementById('studentPasswordError'), label:'Password', type:'password', required:true},
//     {input: document.getElementById('studentConfirmPassword'), error: document.getElementById('studentConfirmError'), label:'Confirm Password', type:'confirm', confirmWith: document.getElementById('studentPassword'), required:true},
//     {input: document.getElementById('studentResume'), error: document.getElementById('studentResumeError'), label:'Resume URL', type:'url', required:false},
//   ]);

//   handleForm(instructorForm,[
//     {input: document.getElementById('instructorName'), error: document.getElementById('instructorNameError'), label:'Name', type:'name', required:true},
//     {input: document.getElementById('instructorEmail'), error: document.getElementById('instructorEmailError'), label:'Email', type:'email', required:true},
//     {input: document.getElementById('instructorPassword'), error: document.getElementById('instructorPasswordError'), label:'Password', type:'password', required:true},
//     {input: document.getElementById('instructorConfirmPassword'), error: document.getElementById('instructorConfirmError'), label:'Confirm Password', type:'confirm', confirmWith: document.getElementById('instructorPassword'), required:true},
//     {input: document.getElementById('instructorResume'), error: document.getElementById('instructorResumeError'), label:'Resume URL', type:'url', required:false},
//     {input: document.getElementById('instructorWebsite'), error: document.getElementById('instructorWebsiteError'), label:'Website URL', type:'url', required:false},
//   ]);

// });



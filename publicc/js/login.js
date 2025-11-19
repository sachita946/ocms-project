const apiUrl = "http://localhost:3000/api/auth";
document.addEventListener('DOMContentLoaded',()=>{

  const loginForm=document.getElementById('loginForm');
  const loginMsg=document.getElementById('loginMsg');

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/^\d+$/.test(email.split('@')[0]);
  }

  loginForm.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('loginEmail').value.trim();
    const password=document.getElementById('loginPassword').value.trim();

    loginMsg.textContent='';
    loginMsg.style.color='red';

    if(!email){ loginMsg.textContent='Email is required'; return;}
    if(!isValidEmail(email)){ loginMsg.textContent='Invalid email'; return;}
    if(!password){ loginMsg.textContent='Password is required'; return;}

    // Mock credentials
    if((email==='student@example.com' || email==='instructor@example.com') && password==='123456'){
      loginMsg.textContent='Login successful! Redirecting...';
      loginMsg.style.color='green';
      setTimeout(()=> window.location.href='index.html',1000);
    } else {
      loginMsg.textContent='Invalid credentials';
    }
  });

});









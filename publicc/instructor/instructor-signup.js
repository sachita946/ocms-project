// instructor-signup.js
(function(){
  const form = document.getElementById('instructorForm');
  const msgBox = document.getElementById('instructorFormMsg');
  const by = id => document.getElementById(id);
  const emailRe = /^[A-Za-z][A-Za-z0-9._%+-]*@[^\s@]+\.[^\s@]+$/;
  const nameRe = /^[A-Za-z\s.'-]{2,}$/;

  function setErr(id,text){ if(by(id)) by(id).textContent = text || ''; }

  function validateFiles(fileInput, allowed, maxMB=5){
    const f = fileInput.files[0];
    if(!f) return {ok:true};
    const extOk = allowed.some(t => f.type === t || f.name.toLowerCase().endsWith(t.replace('image/','.')));
    const sizeOk = f.size <= maxMB * 1024 * 1024;
    if(!extOk) return {ok:false, msg:'Invalid file type'};
    if(!sizeOk) return {ok:false, msg:`File must be <= ${maxMB} MB`};
    return {ok:true};
  }

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    msgBox.textContent=''; msgBox.className='form-msg';

    const name = by('instructorName').value.trim();
    const experience = by('instructorExperience').value;
    const father = by('instructorFatherName').value.trim();
    const country = by('instructorCountry').value.trim();
    const city = by('instructorCity').value.trim();
    const address = by('instructorAddress').value.trim();
    const email = by('instructorEmail').value.trim();
    const phone = by('instructorPhone').value.trim();
    const postal = by('instructorPostal').value.trim();
    const password = by('instructorPassword').value;
    const confirm = by('instructorConfirm').value;
    const subject = by('instructorSubject').value.trim();
    const website = by('instructorWebsite').value.trim();
    const skills = by('instructorSkills').value.trim();
    const bio = by('instructorBio').value.trim();

    // clear errors
    ['instructorNameError','instructorFatherNameError','instructorAddressError','instructorEmailError','instructorPostalError',
     'instructorPasswordError','instructorConfirmError','instructorSubjectError','instructorWebsiteError','instructorProfileError','instructorResumeError','instructorSkillsError','instructorBioError']
     .forEach(id=>setErr(id,''));

    let ok = true;
    if(!name || !nameRe.test(name)){ setErr('instructorNameError','Enter valid name (no numbers)'); ok=false; }
    if(!email || !emailRe.test(email)){ setErr('instructorEmailError','Enter valid email (cannot start with number)'); ok=false; }
    if(!password || password.length < 6){ setErr('instructorPasswordError','Password min 6 chars'); ok=false; }
    if(confirm !== password){ setErr('instructorConfirmError','Passwords do not match'); ok=false; }
    if(postal && !/^[\dA-Za-z\- ]{2,10}$/.test(postal)){ setErr('instructorPostalError','Invalid postal code'); ok=false; }
    if(website && !/^(https?:\/\/)/i.test(website)){ setErr('instructorWebsiteError','Enter full url starting with http(s)'); ok=false; }
    if(skills && skills.length > 300){ setErr('instructorSkillsError','Keep skills shorter'); ok=false; }

    // files
    const pcheck = validateFiles(by('instructorProfileFile'), ['image/jpeg','image/png']);
    if(!pcheck.ok){ setErr('instructorProfileError', pcheck.msg); ok=false; }
    const rcheck = validateFiles(by('instructorResumeFile'), ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
    if(!rcheck.ok){ setErr('instructorResumeError', rcheck.msg); ok=false; }

    if(!ok){ msgBox.textContent='Fix errors above'; msgBox.classList.add('error'); return; }

    const fd = new FormData();
    fd.append('role','instructor');
    fd.append('name', name);
    if(experience) fd.append('experience', experience);
    if(father) fd.append('fatherName', father);
    if(country) fd.append('country', country);
    if(city) fd.append('city', city);
    if(address) fd.append('address', address);
    fd.append('email', email);
    if(phone) fd.append('phone', phone);
    if(postal) fd.append('postal', postal);
    fd.append('password', password);
    if(subject) fd.append('subject', subject);
    if(website) fd.append('website', website);
    if(skills) fd.append('skills', skills);
    if(bio) fd.append('bio', bio);

    const pfile = by('instructorProfileFile').files[0];
    if(pfile) fd.append('profile', pfile);
    const rfile = by('instructorResumeFile').files[0];
    if(rfile) fd.append('resume', rfile);

    try{
      msgBox.textContent = 'Sending...';
      const res = await fetch('/api/auth/signup', { method:'POST', body: fd });
      const data = await res.json();
      if(!res.ok){ msgBox.textContent = data.message || 'Signup failed'; msgBox.classList.add('error'); }
      else { msgBox.textContent = data.message || 'Account created'; msgBox.classList.add('success'); setTimeout(()=> location.href='login.html',1000); }
    }catch(err){
      console.error(err);
      msgBox.textContent = 'Network/server error'; msgBox.classList.add('error');
    }
  });
})();

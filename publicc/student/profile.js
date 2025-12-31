const token = localStorage.getItem('ocms_token');
if (!token) location.href = 'login.html';
async function api(path, opts = {}) {
  opts.headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const r = await fetch('/api' + path, opts);
  return r.json().catch(()=>null);
}

async function load() {
  const p = await api('/profiles/me');
  const area = document.getElementById('profileArea');
  if (!p) { area.textContent = 'Failed to load'; return; }
  area.innerHTML = `<strong>${p.first_name} ${p.last_name}</strong> <div>${p.bio || ''}</div> <div>${p.studentProfile ? 'Student' : (p.instructorProfile ? 'Instructor' : p.role)}</div>`;
  document.getElementById('firstName').value = p.first_name || '';
  document.getElementById('lastName').value = p.last_name || '';
  document.getElementById('bio').value = p.bio || (p.instructorProfile?.bio || '');
  document.getElementById('expertise').value = p.instructorProfile?.expertise_area || '';
  document.getElementById('interests').value = (p.studentProfile?.interests || []).join(', ');
}
document.getElementById('editBtn').addEventListener('click', ()=> document.getElementById('editForm').style.display = '');
document.getElementById('saveProfile').addEventListener('click', async () => {
  const data = {
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    bio: document.getElementById('bio').value,
    expertise: document.getElementById('expertise').value,
    interests: document.getElementById('interests').value.split(',').map(s=>s.trim()).filter(Boolean)
  };
  const res = await api('/profiles/me', { method: 'PUT', body: JSON.stringify(data) });
  if (res) { alert('Saved'); load(); }
});
load();
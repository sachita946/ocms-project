// Resolve backend API base
const BACKEND_ORIGIN = (window.OCMS_API_ORIGIN)
  || 'http://localhost:3000';
const API = `${BACKEND_ORIGIN}/api`;

const token = localStorage.getItem('ocms_token') || localStorage.getItem('token') || '';
const form = document.getElementById('notifForm');
const list = document.getElementById('list');
const btnFilter = document.getElementById('btnFilter');
const filterUser = document.getElementById('filterUser');
const msg = document.getElementById('msg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const user_id = document.getElementById('user_id').value;
  const message = document.getElementById('message').value;
  const res = await fetch(`${API}/notifications`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ user_id, message })
  });
  const data = await res.json();
  msg.textContent = res.ok ? 'Sent' : data.message || 'Error';
  if (res.ok) { form.reset(); load(); }
});

btnFilter.addEventListener('click', load);

async function load(){
  const u = filterUser.value;
  if (!u) return alert('provide user id');
  const res = await fetch(`${API}/notifications?user_id=${u}`, { headers:{ Authorization:`Bearer ${token}` }});
  const arr = await res.json();
  list.innerHTML = arr.map(n => `<div class="item"><div class="small">${new Date(n.created_at).toLocaleString()}</div><div>${n.message}</div></div>`).join('') || '<div class="small">No notifications</div>';
}

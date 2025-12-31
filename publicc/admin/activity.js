const API = '/api';
const token = localStorage.getItem('token') || '';
const form = document.getElementById('actForm');
const list = document.getElementById('list');
const btnFilter = document.getElementById('btnFilter');
const filterUser = document.getElementById('filterUser');
const msg = document.getElementById('msg');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const lesson_id = document.getElementById('lesson_id').value;
  const course_id = document.getElementById('course_id').value;
  const action = document.getElementById('action').value;
  const res = await fetch(`${API}/activities`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ lesson_id, course_id, action })
  });
  const data = await res.json();
  msg.textContent = res.ok ? 'Recorded' : data.message || 'Error';
  if (res.ok) { form.reset(); load(); }
});

btnFilter.addEventListener('click', load);

async function load(){
  const u = filterUser.value;
  const q = u ? `?user_id=${u}` : '';
  const res = await fetch(`${API}/activities${q}`);
  const arr = await res.json();
  list.innerHTML = arr.map(a => `<div class="item"><div class="small">${a.action} — ${new Date(a.created_at).toLocaleString()}</div></div>`).join('') || '<div class="small">No activities</div>';
}
load();

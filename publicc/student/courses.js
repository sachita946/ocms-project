// Fetch and render courses with Enroll buttons
document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Fetch courses
		const res = await fetch('/api/courses');
		const courses = await res.json();
		if (!Array.isArray(courses)) return;

		// If logged in, fetch enrollments to mark enrolled courses
		const token = localStorage.getItem('ocms_token');
		let enrollmentByCourse = new Map();
		if (token) {
			try {
				const meRes = await fetch('/api/enrollments/me', {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				const myEnrollments = await meRes.json().catch(() => []);
				if (Array.isArray(myEnrollments)) {
					myEnrollments.forEach(enr => {
						if (enr.course?.id) enrollmentByCourse.set(enr.course.id, enr);
					});
				}
			} catch {}
		}

		// Create a new section for All Courses
		const main = document.querySelector('main') || document.body;
		const section = document.createElement('section');
		section.className = 'courses-container';
		const header = document.createElement('div');
		header.className = 'page-header';
		header.innerHTML = '<h1>All Courses</h1><p>Browse and enroll to start learning</p>';
		section.appendChild(header);

		const grid = document.createElement('div');
		grid.className = 'grid';
		section.appendChild(grid);
		main.appendChild(section);

		// Render cards
		courses.forEach(course => {
			const card = document.createElement('div');
			card.className = 'card';

			const enrolled = enrollmentByCourse.has(course.id);
			const enrollment = enrollmentByCourse.get(course.id);

			const badge = enrolled ? `<span style="margin-left:8px;padding:4px 8px;border-radius:999px;background:rgba(34,197,94,0.18);color:#22c55e;font-weight:700;font-size:0.8rem;">Enrolled</span>` : '';

			const actions = enrolled
				? `<div style="display:flex;gap:10px;">
						 <a class="btn btn-primary" href="/student/courses-lessons.html" style="text-decoration:none;">Go to Lessons</a>
						 ${enrollment?.id ? `<a class="btn" href="/student/progress.html?enrollmentId=${enrollment.id}" style="border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#eaf4f2;text-decoration:none;">View Progress</a>` : ''}
					 </div>`
				: `<button class="btn btn-primary" data-course-id="${course.id}">Enroll</button>`;

			card.innerHTML = `
				<h3 style="margin-bottom:8px;display:flex;align-items:center;">${escapeHtml(course.title)} ${badge}</h3>
				<p style="color:#9fb5b9;margin-bottom:12px;">${escapeHtml(course.description).slice(0, 140)}${course.description && course.description.length > 140 ? '…' : ''}</p>
				<div style="display:flex;gap:12px;margin-bottom:12px;color:#9fb5b9;">
					<span>Category: ${escapeHtml(course.category || '—')}</span>
					<span>Level: ${escapeHtml(course.level || '—')}</span>
				</div>
				<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
					<strong style="color:#22c55e;">$${Number(course.price || 0).toFixed(2)}</strong>
					${actions}
				</div>
			`;
			grid.appendChild(card);
		});

		// Populate program-specific sections (BIM / CSIT / BCA) using tags
		const programSections = [
			{ key: 'BIM', id: 'BIM-courses' },
			{ key: 'CSIT', id: 'CSIT-courses' },
			{ key: 'BCA', id: 'BCA-courses' }
		];

		programSections.forEach(({ key, id }) => {
			const el = document.getElementById(id);
			if (!el) return;
			const match = courses.filter(c => String(c.tags || '').toUpperCase().includes(key));
			if (!match.length) return; // keep hidden if nothing to show
			el.classList.remove('hidden');

			// Render cards into the section
			match.forEach(course => {
				const card = document.createElement('div');
				card.className = 'card';

				const enrolled = enrollmentByCourse.has(course.id);
				const enrollment = enrollmentByCourse.get(course.id);

				const badge = enrolled ? `<span style="margin-left:8px;padding:4px 8px;border-radius:999px;background:rgba(34,197,94,0.18);color:#22c55e;font-weight:700;font-size:0.8rem;">Enrolled</span>` : '';

				const actions = enrolled
					? `<div style="display:flex;gap:10px;">
							 <a class="btn btn-primary" href="/student/courses-lessons.html" style="text-decoration:none;">Go to Lessons</a>
							 ${enrollment?.id ? `<a class="btn" href="/student/progress.html?enrollmentId=${enrollment.id}" style="border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#eaf4f2;text-decoration:none;">View Progress</a>` : ''}
						 </div>`
					: `<button class="btn btn-primary" data-course-id="${course.id}">Enroll</button>`;

				card.innerHTML = `
					<h3 style="margin-bottom:8px;display:flex;align-items:center;">${escapeHtml(course.title)} ${badge}</h3>
					<p style="color:#9fb5b9;margin-bottom:12px;">${escapeHtml(course.description).slice(0, 140)}${course.description && course.description.length > 140 ? '…' : ''}</p>
					<div style="display:flex;gap:12px;margin-bottom:12px;color:#9fb5b9;">
						<span>Category: ${escapeHtml(course.category || '—')}</span>
						<span>Level: ${escapeHtml(course.level || '—')}</span>
					</div>
					<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
						<strong style="color:#22c55e;">$${Number(course.price || 0).toFixed(2)}</strong>
						${actions}
					</div>
				`;
				el.appendChild(card);
			});
		});

		// Attach enroll handlers (skip for already enrolled)
		grid.addEventListener('click', async (e) => {
			const btn = e.target.closest('button[data-course-id]');
			if (!btn) return;
			const courseId = parseInt(btn.getAttribute('data-course-id'));

			// If already enrolled, ignore
			if (enrollmentByCourse.has(courseId)) return;

			const token2 = localStorage.getItem('ocms_token');
			const role = localStorage.getItem('ocms_role');

			if (!token2) return window.location.href = '/auth/login.html';
			if (role !== 'STUDENT' && role !== 'ADMIN') {
				return alert('Only students can enroll. Please use a student account.');
			}

			btn.disabled = true;
			btn.textContent = 'Enrolling…';
			try {
				const resEnroll = await fetch('/api/enrollments', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token2}`
					},
					body: JSON.stringify({ course_id: courseId })
				});
				const data = await resEnroll.json().catch(() => null);
				if (!resEnroll.ok) {
					btn.disabled = false;
					btn.textContent = 'Enroll';
					return alert(data?.message || 'Failed to enroll');
				}

				// Redirect to lessons after successful enrollment
				window.location.href = '/student/courses-lessons.html';
			} catch (err) {
				btn.disabled = false;
				btn.textContent = 'Enroll';
				alert('Network error. Please try again.');
			}
		});
	} catch (err) {
		console.error('Failed to load courses', err);
	}
});

function escapeHtml(str) {
	if (!str) return '';
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}


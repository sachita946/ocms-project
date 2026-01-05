// Student lesson page logic: video progress, quiz gate, restart, and extra courses
const token = localStorage.getItem('ocms_token');
const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

const video = document.getElementById('lessonVideo');
const source = document.getElementById('lessonVideoSrc');
const progressFill = document.getElementById('progressFill');
const watchLabel = document.getElementById('watchLabel');
const timeLabel = document.getElementById('timeLabel');
const btnQuiz = document.getElementById('btnQuiz');
const btnNotes = document.getElementById('btnNotes');
const btnRestart = document.getElementById('btnRestart');
const btnDownload = document.getElementById('btnDownload');
const btnCertificate = document.getElementById('btnCertificate');
const lessonsContainer = document.getElementById('lessonsContainer');
const extraCoursesEl = document.getElementById('extraCourses');
const playerMsg = document.getElementById('playerMsg');

let currentLesson = null;
let enrolledCourseIds = new Set();
let maxWatched = 0;
let currentUserId = null;
let certificateIssued = false;
const QUIZ_UNLOCK_PCT = 80; // unlock quiz after 80% watched

function isEnrolled(courseId) {
  if (!courseId) return false;
  return enrolledCourseIds.has(Number(courseId));
}

function fmtTime(seconds = 0) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function setProgress(current, duration) {
  const pct = duration ? Math.min(100, Math.round((current / duration) * 100)) : 0;
  progressFill.style.width = `${pct}%`;
  watchLabel.textContent = `Watched: ${pct}%`;
  timeLabel.textContent = `${fmtTime(current)} / ${fmtTime(duration)}`;

  // unlock quiz when threshold met
  if (pct >= QUIZ_UNLOCK_PCT && currentLesson && isEnrolled(currentLesson.course_id)) {
    const quizLink = `quizees.html?lessonId=${currentLesson.id}`;
    enableQuiz(quizLink);
  }
}

function enableQuiz(link) {
  btnQuiz.textContent = 'Start Quiz';
  btnQuiz.setAttribute('aria-disabled', 'false');
  btnQuiz.classList.remove('ghost');
  btnQuiz.classList.add('btn');
  btnQuiz.href = link || '#';
}

function lockQuiz() {
  btnQuiz.textContent = 'Quiz (locked)';
  btnQuiz.setAttribute('aria-disabled', 'true');
  btnQuiz.href = '#';
  btnQuiz.classList.add('ghost');
}

function bindVideoEvents() {
  if (!video) return;
  video.addEventListener('play', () => {
    if (currentLesson && !isEnrolled(currentLesson.course_id)) {
      video.pause();
      playerMsg.textContent = 'Please enroll and pay for this course to watch the video.';
      return;
    }
  });
  video.addEventListener('seeking', () => {
    if (video.currentTime > maxWatched + 1) {
      video.currentTime = maxWatched;
    }
  });
  video.addEventListener('timeupdate', () => {
    setProgress(video.currentTime, video.duration || 0);
    maxWatched = Math.max(maxWatched, video.currentTime || 0);
  });
  video.addEventListener('ended', () => {
    setProgress(video.duration || 0, video.duration || 0);
    playerMsg.textContent = 'Great! Quiz unlocked.';
    if (currentLesson && isEnrolled(currentLesson.course_id)) {
      const quizLink = `quizees.html?lessonId=${currentLesson.id}`;
      enableQuiz(quizLink);
      issueCertificateIfNeeded();
    } else {
      enableQuiz('#');
    }
  });
}

function bindRestart() {
  if (!btnRestart) return;
  btnRestart.addEventListener('click', (e) => {
    e.preventDefault();
    if (!video) return;
    video.currentTime = 0;
    video.play();
    lockQuiz();
    playerMsg.textContent = 'Restarted from 0. Watch to unlock quiz.';
  });
}

function loadLessons() {
  if (!lessonsContainer) return;
  
  // Get subject_id from URL if provided
  const params = new URLSearchParams(window.location.search);
  const subjectId = params.get('subject_id');
  
  const url = subjectId ? `/api/lessons?subject_id=${subjectId}` : '/api/lessons';
  
  fetch(url, { headers })
    .then(res => res.json())
    .then(data => {
      const lessons = Array.isArray(data) ? data : (data.lessons || []);
      if (!lessons.length) {
        lessonsContainer.innerHTML = '<p>No lessons found.</p>';
        return;
      }
      lessonsContainer.innerHTML = lessons.map(l => lessonCard(l)).join('');
      const first = lessons[0];
      setActiveLesson(first);
    })
    .catch(() => {
      lessonsContainer.innerHTML = '<p class="error">Failed to load lessons.</p>';
    });
}

function loadEnrollments() {
  return fetch('/api/enrollments/me', { headers })
    .then(res => res.json())
    .then(data => {
      const enrollments = Array.isArray(data) ? data : (data.enrollments || data || []);
      enrolledCourseIds = new Set(enrollments.map(e => Number(e.course_id || e.course?.id)).filter(Boolean));
    })
    .catch(() => {
      enrolledCourseIds = new Set();
    });
}

function lessonCard(lesson) {
  const typeLabel = lesson.content_type || 'VIDEO';
  return `
    <div class="card">
      <h3>${lesson.title || 'Untitled lesson'}</h3>
      <p>${typeLabel}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn" onclick='setActiveLesson(${JSON.stringify(lesson)})'>Play</button>
        <a class="btn ghost" href="quizees.html?lessonId=${lesson.id || ''}">Quiz</a>
      </div>
    </div>
  `;
}

window.setActiveLesson = function(lesson) {
  if (!lesson || !video || !source) return;
  currentLesson = lesson;
  maxWatched = 0;
  certificateIssued = false;

  // Gate by enrollment/payment
  const enrolled = isEnrolled(lesson.course_id);
  if (!enrolled) {
    source.src = '';
    video.load();
    video.controls = false;
    lockQuiz();
    const payLink = `payment.html?courseId=${lesson.course_id || ''}`;
    playerMsg.innerHTML = `Please enroll and pay for this course to watch and take the quiz. <a class="btn" style="margin-left:8px;" href="${payLink}">Enroll & Pay</a>`;
    return;
  }

  source.src = lesson.content_url || '';
  video.load();
  video.currentTime = 0;
  video.controls = true;

  if (lesson.pdf_url) {
    document.getElementById('pdfFrame').src = lesson.pdf_url;
  }
  if (lesson.id) {
    btnNotes.href = `notes.html?lessonId=${lesson.id}`;
    btnCertificate.href = `certificate.html?lessonId=${lesson.id}`;
    btnDownload.href = lesson.pdf_url || '#';
    lockQuiz();
  }
  playerMsg.textContent = 'Started lesson. Watch to unlock quiz.';
};

function loadExtraCourses() {
  if (!extraCoursesEl) return;
  fetch('/api/courses', { headers })
    .then(res => res.json())
    .then(data => {
      const courses = Array.isArray(data) ? data : (data.courses || []);
      const picks = courses.slice(0, 3);
      if (!picks.length) {
        extraCoursesEl.innerHTML = '<p>No extra courses available right now.</p>';
        return;
      }
      extraCoursesEl.innerHTML = picks.map(c => `
        <div class="extra-card">
          <div class="pill">Extra Course</div>
          <h4>${c.title}</h4>
          <p>${c.description || 'Boost your skills with this course.'}</p>
          <div class="extra-meta">
            <span>${c.category || 'General'}</span>
            <span>${c.level || 'Beginner'}</span>
          </div>
          <a class="btn" href="payment.html?courseId=${c.id}">Enroll & Pay</a>
        </div>
      `).join('');
    })
    .catch(() => {
      extraCoursesEl.innerHTML = '<p class="error">Unable to load extra courses.</p>';
    });
}

function loadProfile() {
  return fetch('/api/profile/me', { headers })
    .then(res => res.json())
    .then(data => {
      currentUserId = data.id || data.user?.id || null;
    })
    .catch(() => {
      currentUserId = null;
    });
}

function issueCertificateIfNeeded() {
  if (certificateIssued) return;
  if (!currentLesson || !currentUserId || !isEnrolled(currentLesson.course_id)) return;
  fetch('/api/certificates/issue', {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: currentUserId, course_id: currentLesson.course_id })
  })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data && data.code) {
        playerMsg.textContent = `Certificate issued. Code: ${data.code}`;
        certificateIssued = true;
      }
    })
    .catch(() => {});
}

function init() {
  bindVideoEvents();
  bindRestart();
  Promise.all([loadProfile(), loadEnrollments()]).finally(() => {
    loadLessons();
  });
  loadExtraCourses();
}

document.addEventListener('DOMContentLoaded', init);

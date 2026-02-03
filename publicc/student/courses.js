// Courses Page - Database-driven course listing
const API_URL = '/api';
let allCourses = [];
let enrolledCourseIds = new Set();

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : '';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadEnrollments();
  await loadCourses();
  
  // Check for enrollment parameter in URL (from login/signup redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const enrollCourseId = urlParams.get('enroll');
  
  if (enrollCourseId && localStorage.getItem('ocms_token')) {
    // User is logged in and wants to enroll in a specific course
    const course = allCourses.find(c => c.id === parseInt(enrollCourseId));
    if (course) {
      if (course.price && course.price > 0) {
        // Paid course - redirect to payment
        // Store Zoom link for post-payment redirect
        if (course.zoom_link) {
          localStorage.setItem('payment_return_url', course.zoom_link);
        }
        window.location.href = `payment.html?courseId=${enrollCourseId}&courseName=${encodeURIComponent(course.title)}&price=${course.price}`;
      } else {
        // Free course - enroll directly
        await processEnrollment(enrollCourseId);
      }
    }
    // Clean up URL
    const newUrl = window.location.pathname;
    history.replaceState({}, '', newUrl);
  }
});

// Load user enrollments
async function loadEnrollments() {
  const token = localStorage.getItem('ocms_token') || localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/enrollments/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const enrollments = await response.json();

    if (Array.isArray(enrollments)) {
      enrollments.forEach(enr => {
        if (enr.course_id) enrolledCourseIds.add(enr.course_id);
      });
    }
    console.log(`✅ Loaded ${enrolledCourseIds.size} enrollments`);
  } catch (error) {
    console.log('❌ Could not fetch enrollments:', error);
  }
}

// Load courses from database API only
async function loadCourses() {
  try {
    const response = await fetch(`${API_URL}/courses?is_published=true`);
    if (response.ok) {
      const apiCourses = await response.json();

      // Add API courses to allCourses
      apiCourses.forEach(course => {
        allCourses.push({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          language: course.language,
          promo_video_url: course.promo_video_url,
          thumbnail_url: course.thumbnail_url,
          instructor: course.instructor,
          lessons: course.lessons || [],
          duration_weeks: course.duration_weeks,
          zoom_link: course.zoom_link,
          _count: course._count || { enrollments: 0, lessons: 0 }
        });
      });

      console.log(`✅ Loaded ${apiCourses.length} courses from API`);
    } else {
      console.log('❌ Could not fetch API courses, no courses available');
    }
  } catch (error) {
    console.log('❌ Could not fetch API courses:', error);
  }

  // Render all courses
  renderAllCourses();
}

// Render all courses in a single container
function renderAllCourses() {
  const container = document.getElementById('advanced-courses');
  if (!container) return;

  if (allCourses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>📚 No courses available</h3>
        <p>Courses will be available soon. Check back later!</p>
      </div>
    `;
    container.classList.remove('hidden');
    return;
  }

  // Group courses by level
  const groupedCourses = {
    BEGINNER: allCourses.filter(course => course.level === 'BEGINNER'),
    INTERMEDIATE: allCourses.filter(course => course.level === 'INTERMEDIATE'),
    ADVANCED: allCourses.filter(course => course.level === 'ADVANCED')
  };

  let html = '';

  // Render each level section
  Object.entries(groupedCourses).forEach(([level, courses]) => {
    if (courses.length === 0) return;

    const levelLabel = level.charAt(0) + level.slice(1).toLowerCase();
    const levelIcon = level === 'BEGINNER' ? '🌱' : level === 'INTERMEDIATE' ? '🚀' : '💎';

    html += `
      <div class="course-level-section">
        <h3 class="level-title">${levelIcon} ${levelLabel} Courses</h3>
        <div class="courses-grid">
          ${courses.map(course => createCourseCard(course)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  container.classList.remove('hidden');

  // Add event listeners to enroll buttons
  container.querySelectorAll('[data-enroll-id]').forEach(btn => {
    btn.addEventListener('click', () => enrollInCourse(btn.dataset.enrollId));
  });
}

// Create course card HTML
function createCourseCard(course) {
  const isEnrolled = enrolledCourseIds.has(course.id);
  const price = course.price ? `NPR ${parseFloat(course.price).toLocaleString()}` : 'Free';
  const level = course.level || 'BEGINNER';
  const instructor = course.instructor?.first_name && course.instructor?.last_name
    ? `${course.instructor.first_name} ${course.instructor.last_name}`
    : course.instructor?.email || 'Unknown Instructor';
  const duration = course.duration_weeks ? `${course.duration_weeks} weeks` : 'Self-paced';

  return `
    <div class="card" data-course-id="${course.id}">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; padding: 4px 12px; background: rgba(6, 182, 212, 0.3); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 6px; font-size: 12px; font-weight: 600; color: #93c5fd;">
            ${level}
        </span>
        ${isEnrolled ? `
          <span style="display: inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.3); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 6px; font-size: 12px; font-weight: 600; color: #86efac; margin-left: 8px;">
            ✓ Enrolled
          </span>
        ` : ''}
      </div>

      <h3>${escapeHtml(course.title)}</h3>

      <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 8px;">
        👨‍🏫 ${escapeHtml(instructor)}
      </div>

      <p>${escapeHtml(course.description || 'No description available').substring(0, 120)}${course.description && course.description.length > 120 ? '...' : ''}</p>

      <div class="course-meta">
        <span>⏱️ ${duration}</span>
        <span>📁 ${escapeHtml(course.category || 'General')}</span>
        <span>🌐 ${escapeHtml(course.language || 'English')}</span>
        ${course._count?.enrollments ? `<span>👥 ${course._count.enrollments} enrolled</span>` : ''}
      </div>

      ${course.promo_video_url ? `
        <div style="margin: 12px 0;">
          <iframe width="100%" height="200" src="https://www.youtube.com/embed/${getYouTubeVideoId(course.promo_video_url)}" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
        </div>
      ` : ''}

      <div class="course-footer">
        <div class="course-price ${!course.price || course.price === 0 ? 'free' : ''}">
          ${price}
        </div>

        <div class="course-actions">
          ${course.zoom_link ? `
            <a href="${course.zoom_link}" target="_blank" class="btn btn-zoom">
              📹 Join Zoom Class
            </a>
          ` : ''}
          ${isEnrolled
            ? `
              <a href="courses-lessons.html?courseId=${course.id}" class="btn btn-primary">
                📖 View Lessons
              </a>
              <a href="course-resources.html?courseId=${course.id}" class="btn btn-secondary">
                📚 Resources
              </a>
            `
            : `
              <button class="btn btn-primary" data-enroll-id="${course.id}">
                ✨ Enroll Now
              </button>
              <button class="btn btn-secondary" onclick="viewCourseDetails(${course.id})">
                ℹ️ Details
              </button>
            `
          }
        </div>
      </div>

      <!-- Course Resources -->
      <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.15); flex-wrap: wrap;">
        <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px;" onclick="openCourseResource(${course.id}, '${course.title}', 'notes')">
          📝 Notes
        </button>
        <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px;" onclick="openCourseResource(${course.id}, '${course.title}', 'questions')">
          ❓ Questions
        </button>
        <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px;" onclick="openCourseResource(${course.id}, '${course.title}', 'preboard')">
          🎯 Pre-board Materials
        </button>
      </div>
    </div>
  `;
}

// Process enrollment after confirmation
async function processEnrollment(courseId) {
  const course = allCourses.find(c => c.id === parseInt(courseId));
  const token = localStorage.getItem('ocms_token');

  try {
    console.log(`🚀 Attempting enrollment for course: ${courseId}`);
    const response = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: parseInt(courseId) })
    });

    if (response.ok) {
      const enrollment = await response.json();
      enrolledCourseIds.add(parseInt(courseId));
      showInlineMessage('Successfully enrolled! You can now access the course.', 'success');
      console.log('✅ Enrollment successful:', enrollment);

      // Re-render courses to show enrolled status
      renderAllCourses();
    } else {
      const error = await response.json();
      console.log('❌ Enrollment failed:', error);
      showInlineMessage(error.message || 'Failed to enroll in course', 'error');
    }
  } catch (error) {
    console.error('❌ Enrollment error:', error);
    showInlineMessage('Failed to enroll. Please try again.', 'error');
  }
}

// Enroll in course - check payment status first
async function enrollInCourse(courseId) {
  const course = allCourses.find(c => c.id === parseInt(courseId));
  if (!course) return;

  const token = localStorage.getItem('ocms_token') || localStorage.getItem('token');
  if (!token) {
    // Not logged in - redirect to login with enrollment intent
    window.location.href = `../auth/login.html?redirect=courses&enroll=${courseId}`;
    return;
  }

  // Check if already enrolled
  if (enrolledCourseIds.has(parseInt(courseId))) {
    showInlineMessage('You are already enrolled in this course!', 'info');
    return;
  }

  // For free courses, enroll directly
  if (!course.price || course.price <= 0) {
    await processEnrollment(courseId);
    return;
  }

  // For paid courses, check payment status first
  try {
    const paymentResponse = await fetch(`${API_URL}/payments/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (paymentResponse.ok) {
      const payments = await paymentResponse.json();
      const completedPayment = payments.find(p =>
        p.course_id === parseInt(courseId) &&
        p.status === 'COMPLETED'
      );

      if (completedPayment) {
        // User has already paid - enroll directly
        await processEnrollment(courseId);
        return;
      }
    }
  } catch (error) {
    console.log('Could not check payment status:', error);
    // Continue to payment anyway
  }

  // No completed payment found - redirect to payment
  if (course.zoom_link) {
    localStorage.setItem('payment_return_url', course.zoom_link);
  }
  window.location.href = `payment.html?courseId=${courseId}&courseName=${encodeURIComponent(course.title)}&price=${course.price}`;
}

// View course details
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inline message functions
function showInlineMessage(message, type = 'info') {
  const messageContainer = document.getElementById('inlineMessage');
  const messageText = document.getElementById('messageText');

  messageText.textContent = message;
  messageContainer.className = `inline-message ${type}`;
  messageContainer.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideInlineMessage();
  }, 5000);
}

function hideInlineMessage() {
  const messageContainer = document.getElementById('inlineMessage');
  messageContainer.style.display = 'none';
}

// Open course resource (notes, questions, preboard)
function openCourseResource(courseId, courseName, resourceType) {
  const token = localStorage.getItem('ocms_token') || localStorage.getItem('token');

  if (!token) {
    showInlineMessage('Please login to access resources', 'info');
    setTimeout(() => {
      window.location.href = '../auth/login.html';
    }, 2000);
    return;
  }

  // Redirect to course resources page
  window.location.href = `course-resources.html?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&type=${resourceType}`;
}

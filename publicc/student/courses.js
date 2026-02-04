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
  await loadCurriculumData(); // Load curriculum data from API
  
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

// Load curriculum data from API
async function loadCurriculumData() {
  try {
    const programs = ['BIM', 'CSIT', 'BCA'];
    
    for (const program of programs) {
      const response = await fetch(`${API_URL}/lesson-resources/curriculum?program=${program}`);
      
      if (response.ok) {
        const data = await response.json();
        renderCurriculumSection(program, data.semesters);
      } else {
        console.error(`Failed to load ${program} curriculum:`, await response.text());
      }
    }
  } catch (error) {
    console.error('Error loading curriculum data:', error);
    // If API fails, the static HTML will remain visible
  }
}

// Render curriculum section dynamically
function renderCurriculumSection(program, semesters) {
  // Find the existing curriculum section for this program
  const existingSections = document.querySelectorAll('.curriculum-section');
  let targetSection = null;
  
  existingSections.forEach(section => {
    const heading = section.querySelector('h3');
    if (heading && heading.textContent.includes(program)) {
      targetSection = section;
    }
  });

  if (!targetSection) {
    console.warn(`No section found for ${program}`);
    return;
  }

  // Clear existing content but keep the heading
  const heading = targetSection.querySelector('h3').cloneNode(true);
  const resourceNote = targetSection.querySelector('.resource-note').cloneNode(true);
  targetSection.innerHTML = '';
  targetSection.appendChild(heading);
  targetSection.appendChild(resourceNote);

  // Create curriculum grid
  const grid = document.createElement('div');
  grid.className = 'curriculum-grid';

  // Render each semester
  semesters.forEach(semester => {
    const semesterCard = document.createElement('div');
    semesterCard.className = 'semester-card';

    const semesterHeading = document.createElement('h4');
    semesterHeading.textContent = semester.name;
    semesterCard.appendChild(semesterHeading);

    const subjectList = document.createElement('ul');
    subjectList.className = 'subject-list';

    semester.subjects.forEach(subject => {
      const listItem = document.createElement('li');
      listItem.className = 'subject-item';
      listItem.setAttribute('data-subject', subject.title);
      listItem.setAttribute('data-program', program);
      listItem.setAttribute('data-semester', semester.semester_num);

      listItem.innerHTML = `
        <span class="subject-name">${subject.title}</span>
        <div class="subject-actions">
          <button class="resource-btn notes-btn" onclick="viewSubjectResources(${subject.id}, '${subject.title.replace(/'/g, "\\'")}', 'notes')">📝 Notes</button>
          <button class="resource-btn preboard-btn" onclick="viewSubjectResources(${subject.id}, '${subject.title.replace(/'/g, "\\'")}', 'preboard')">📋 Preboard</button>
          <button class="resource-btn board-btn" onclick="viewSubjectResources(${subject.id}, '${subject.title.replace(/'/g, "\\'")}', 'board')">🎯 Board</button>
        </div>
      `;

      subjectList.appendChild(listItem);
    });

    semesterCard.appendChild(subjectList);
    grid.appendChild(semesterCard);
  });

  targetSection.appendChild(grid);

  const note = document.createElement('p');
  note.className = 'resource-note';
  note.textContent = 'Click on resource buttons to view and download study materials.';
  targetSection.appendChild(note);
}

// View subject resources (for students)
async function viewSubjectResources(subjectId, subjectTitle, resourceType) {
  try {
    const response = await fetch(`${API_URL}/lesson-resources/subject-resources?subject_id=${subjectId}&type=${resourceType}`);
    const data = await response.json();

    if (data.resources && data.resources.length > 0) {
      showResourcesModal(subjectTitle, resourceType, data.resources);
    } else {
      showInlineMessage(`No ${resourceType} available for ${subjectTitle} yet.`, 'info');
    }
  } catch (error) {
    console.error('Failed to load resources:', error);
    showInlineMessage('Failed to load resources', 'error');
  }
}

// Show resources in a modal
function showResourcesModal(subjectTitle, resourceType, resources) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('resourcesViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'resourcesViewModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="resourcesModalTitle"></h2>
          <button class="close-btn" onclick="closeResourcesModal()">&times;</button>
        </div>
        <div class="modal-body" id="resourcesModalBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('resourcesModalTitle').textContent = `${subjectTitle} - ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`;
  
  const body = document.getElementById('resourcesModalBody');
  body.innerHTML = resources.map(resource => `
    <div style="background: rgba(255,255,255,0.05); padding: 15px; margin-bottom: 10px; border-radius: 8px;">
      <h3 style="margin-bottom: 8px; font-size: 16px;">${resource.title}</h3>
      ${resource.content ? `<p style="opacity: 0.8; font-size: 14px; margin-bottom: 10px;">${resource.content}</p>` : ''}
      ${resource.file_url ? `
        <a href="${resource.file_url}" target="_blank" download class="btn btn-primary" style="display: inline-block; margin-top: 8px;">
          <i class="fas fa-download"></i> Download
        </a>
      ` : ''}
      <div style="font-size: 12px; opacity: 0.6; margin-top: 8px;">
        Uploaded by: ${resource.user ? resource.user.first_name + ' ' + resource.user.last_name : 'Unknown'}
      </div>
    </div>
  `).join('');

  modal.style.display = 'block';
}

function closeResourcesModal() {
  const modal = document.getElementById('resourcesViewModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

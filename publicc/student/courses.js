// Courses Page with BIM, CSIT, BCA Programs (static TU syllabus data)
const API_URL = '/api';
let allCourses = [];
let enrolledCourseIds = new Set();
let currentEnrollmentCourse = null;

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : '';
}

// Static course lists by program/semester (frontend only)
const STATIC_COURSES = {
  BIM: {
    1: [
      'Business Mathematics',
      'English I',
      'Introduction to Information Technology',
      'Sociology',
      'Principles of Management'
    ],
    2: [
      'Financial Accounting',
      'English II',
      'Micro Economics',
      'Computer Programming',
      'Business Statistics'
    ],
    3: [
      'Data Communication and Networking',
      'Web Technology I',
      'Cost and Management Accounting',
      'Organizational Behavior',
      'System Analysis and Design'
    ],
    4: [
      'Database Management System',
      'Web Technology II',
      'Macro Economics',
      'Operations Management',
      'Business Research Methods'
    ],
    5: [
      'Object-Oriented Programming (Java)',
      'Software Engineering',
      'Information Security Management',
      'Financial Management',
      'Management Information System'
    ],
    6: [
      'Artificial Intelligence',
      'E-Commerce',
      'Mobile Application Development',
      'Business Strategy',
      'Internship'
    ],
    7: [
      'Project Management',
      'Digital Marketing',
      'Cloud Computing',
      'Data Mining',
      'Elective I'
    ],
    8: [
      'Final Year Project',
      'Entrepreneurship',
      'Knowledge Management',
      'Elective II',
      'Seminar'
    ]
  },
  CSIT: {
    1: [
      'Introduction to Information Technology',
      'C Programming',
      'Digital Logic',
      'Mathematics I',
      'Physics'
    ],
    2: [
      'Discrete Mathematics',
      'Object-Oriented Programming (C++)',
      'Microprocessor',
      'Mathematics II',
      'Statistics I'
    ],
    3: [
      'Data Structures and Algorithms',
      'Computer Organization and Architecture',
      'Numerical Methods',
      'Statistics II',
      'Computer Graphics'
    ],
    4: [
      'Operating Systems',
      'Database Management System',
      'Artificial Intelligence',
      'Theory of Computation',
      'Computer Networks'
    ],
    5: [
      'Software Engineering',
      'Web Technology',
      'Cryptography',
      'Simulation and Modeling',
      'Technical Writing'
    ],
    6: [
      'Compiler Design',
      'E-Governance',
      'Image Processing',
      'Mobile Computing',
      'Minor Project'
    ],
    7: [
      'Data Mining and Warehousing',
      'Cloud Computing',
      'Network Security',
      'Distributed Systems',
      'Elective I'
    ],
    8: [
      'Final Year Project',
      'Advanced Java Programming',
      'Big Data Technologies',
      'Elective II',
      'Seminar'
    ]
  },
  BCA: {
    1: [
      'Computer Fundamentals',
      'Programming in C',
      'Mathematics',
      'English',
      'Digital Systems'
    ],
    2: [
      'Data Structures',
      'Object-Oriented Programming (C++)',
      'Discrete Mathematics',
      'Financial Accounting',
      'Communication Skills'
    ],
    3: [
      'Database Management System',
      'Operating System',
      'Software Engineering',
      'Computer Networks',
      'Web Technology'
    ],
    4: [
      'Java Programming',
      'System Analysis and Design',
      'Numerical Methods',
      'Computer Graphics',
      'E-Commerce'
    ],
    5: [
      'Python Programming',
      'Mobile Application Development',
      'Artificial Intelligence',
      'Linux Administration',
      'MIS'
    ],
    6: [
      'Data Mining',
      'Cloud Computing',
      'Network Security',
      'Project Work',
      'Internship'
    ],
    7: [
      'Big Data Analytics',
      'Internet of Things (IoT)',
      'Software Testing',
      'Elective I',
      'Research Methodology'
    ],
    8: [
      'Final Year Project',
      'Cyber Law and Ethics',
      'Digital Marketing',
      'Elective II',
      'Seminar'
    ]
  }
};

// Program and semester state
const programs = ['BIM', 'CSIT', 'BCA'];
let currentSemesters = {
  BIM: 1,
  CSIT: 1,
  BCA: 1
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadEnrollments();
  await loadCourses();
  initializeSemesterButtons();
  
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
  } catch (error) {
    console.log('Could not fetch enrollments:', error);
  }
}

// Load all courses (frontend static data + API)
async function loadCourses() {
  // First, try to load published courses from API
  try {
    const response = await fetch('/api/courses');
    if (response.ok) {
      const apiCourses = await response.json();
      const publishedCourses = apiCourses.filter(course => course.is_published);
      // Add API courses to allCourses
      publishedCourses.forEach(course => {
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
          program: 'ADVANCED',  // Treat API courses as advanced
          isFromAPI: true
        });
      });
    }
  } catch (error) {
    console.log('Could not fetch API courses, using static data:', error);
  }

  // Flatten static courses into a list that matches renderer expectations
  let idCounter = Math.max(...allCourses.map(c => c.id), 0) + 1;
  programs.forEach(program => {
    const semesters = STATIC_COURSES[program];
    Object.entries(semesters).forEach(([sem, titles]) => {
      titles.forEach(title => {
        allCourses.push({
          id: idCounter++,
          title,
          description: `${program} Semester ${sem} course`,
          program,
          semester: Number(sem),
          price: 0,
          level: 'BEGINNER',
          language: 'English',
          category: program,
          lessons: [],
        });
      });
    });
  });

  // Add advanced courses
  const advancedCourses = [
    {
      id: idCounter++,
      title: 'UI/UX Design Masterclass',
      description: 'Learn modern UI/UX design principles with Figma, Adobe XD, and prototyping tools. Includes live Zoom sessions with industry experts.',
      program: 'ADVANCED',
      semester: 1,
      price: 15000,
      level: 'ADVANCED',
      language: 'English',
      category: 'Design',
      instructor: { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@eduverse.com' },
      lessons: [],
      hasZoom: true,
      zoom_link: 'https://zoom.us/j/1234567890',
      promo_video_url: 'https://youtu.be/dQw4w9WgXcQ'  // Example video
    },
    {
      id: idCounter++,
      title: 'React.js Development Bootcamp',
      description: 'Master React.js from basics to advanced concepts including hooks, context, Redux, and Next.js. Live coding sessions via Zoom.',
      program: 'ADVANCED',
      semester: 1,
      price: 20000,
      level: 'INTERMEDIATE',
      language: 'English',
      category: 'Web Development',
      instructor: { first_name: 'Mike', last_name: 'Chen', email: 'mike@eduverse.com' },
      lessons: [],
      hasZoom: true,
      zoom_link: 'https://zoom.us/j/0987654321',
      promo_video_url: 'https://youtu.be/dQw4w9WgXcQ'
    },
    {
      id: idCounter++,
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js, Express, MongoDB, and REST APIs. Includes live Zoom workshops.',
      program: 'ADVANCED',
      semester: 1,
      price: 18000,
      level: 'INTERMEDIATE',
      language: 'English',
      category: 'Backend Development',
      instructor: { first_name: 'Alex', last_name: 'Rodriguez', email: 'alex@eduverse.com' },
      lessons: [],
      hasZoom: true,
      zoom_link: 'https://zoom.us/j/1122334455',
      promo_video_url: 'https://youtu.be/dQw4w9WgXcQ'
    },
    {
      id: idCounter++,
      title: 'Python with Django Framework',
      description: 'Full-stack Python development with Django, PostgreSQL, and modern web development practices. Live Zoom mentoring included.',
      program: 'ADVANCED',
      semester: 1,
      price: 17000,
      level: 'INTERMEDIATE',
      language: 'English',
      category: 'Python Development',
      instructor: { first_name: 'Emma', last_name: 'Davis', email: 'emma@eduverse.com' },
      lessons: [],
      hasZoom: true,
      zoom_link: 'https://zoom.us/j/5566778899',
      promo_video_url: 'https://youtu.be/dQw4w9WgXcQ'
    },
    {
      id: idCounter++,
      title: 'Artificial Intelligence & Machine Learning',
      description: 'Comprehensive AI/ML course covering Python, TensorFlow, scikit-learn, and deep learning. Includes live Zoom discussions with AI experts.',
      program: 'ADVANCED',
      semester: 1,
      price: 25000,
      level: 'ADVANCED',
      language: 'English',
      category: 'AI/ML',
      instructor: { first_name: 'Dr. James', last_name: 'Wilson', email: 'james@eduverse.com' },
      lessons: [],
      hasZoom: true,
      zoom_link: 'https://zoom.us/j/6677889900',
      promo_video_url: 'https://youtu.be/dQw4w9WgXcQ'
    }
  ];

  allCourses = allCourses.concat(advancedCourses);

  programs.forEach(program => renderProgramCourses(program));
  renderAdvancedCourses();
}

// Initialize semester button handlers
function initializeSemesterButtons() {
  document.querySelectorAll('.semester-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const program = this.closest('.course-filters').querySelector('h2').textContent.split(' ')[0];
      const semester = parseInt(this.dataset.sem);
      
      // Update active button
      this.closest('.semester-selection').querySelectorAll('.semester-btn').forEach(b => {
        b.classList.remove('active');
      });
      this.classList.add('active');
      
      // Update semester state and render
      currentSemesters[program] = semester;
      renderProgramCourses(program);
    });
  });
}

// Render courses for a specific program
function renderProgramCourses(program) {
  const container = document.getElementById(`${program}-courses`);
  if (!container) return;
  
  const semester = currentSemesters[program];
  
  // Filter courses by program and semester
  const filteredCourses = allCourses.filter(course => 
    course.program === program && course.semester === semester
  );
  
  if (filteredCourses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>📚 No courses found</h3>
        <p>${program} - Semester ${semester} courses will be added soon.</p>
      </div>
    `;
    container.classList.remove('hidden');
    return;
  }
  
  container.innerHTML = filteredCourses.map(course => createCourseCard(course)).join('');
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
      </div>
      
      ${renderCoursePDFs(course)}
      
      <div class="course-footer">
        <div class="course-price ${!course.price || course.price === 0 ? 'free' : ''}">
          ${price}
        </div>
        
        <div class="course-actions">
          ${isEnrolled 
            ? `
              <a href="courses-lessons.html?courseId=${course.id}" class="btn btn-primary">
                📖 View Lessons
              </a>
              <a href="progress.html?courseId=${course.id}" class="btn btn-secondary">
                📊 Progress
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
        <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px;" onclick="openCourseResource(${course.id}, '${course.title}', 'board')">
          🏁 Board Questions
        </button>
        <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px;" onclick="openCourseResource(${course.id}, '${course.title}', 'preboard')">
          🎯 Pre-board Questions
        </button>
      </div>
    </div>
  `;
}

// Render PDF resources for a course
function renderCoursePDFs(course) {
  if (!course.lessons || course.lessons.length === 0) return '';

  const pdfResources = [];
  course.lessons.forEach(lesson => {
    if (lesson.resources) {
      lesson.resources.forEach(resource => {
        if (resource.file_type === 'PDF' || resource.file_type === 'application/pdf') {
          pdfResources.push({
            ...resource,
            lessonTitle: lesson.title
          });
        }
      });
    }
  });

  if (pdfResources.length === 0) return '';

  return `
    <div style="margin-top: 16px; padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1);">
      <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: rgba(255, 255, 255, 0.9);">
        📄 PDF Materials (${pdfResources.length})
      </div>
      ${pdfResources.slice(0, 3).map(pdf => `
        <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <span>📕</span>
          <div style="flex: 1; font-size: 12px;">
            <div style="font-weight: 600; color: #fff;">${escapeHtml(pdf.title)}</div>
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6);">${pdf.lessonTitle}</div>
          </div>
          <button onclick="viewPDF('${pdf.file_url}', '${escapeHtml(pdf.title)}')" style="padding: 4px 10px; background: rgba(239, 68, 68, 0.3); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
            View
          </button>
        </div>
      `).join('')}
      ${pdfResources.length > 3 ? `
        <div style="margin-top: 8px; font-size: 11px; color: rgba(255, 255, 255, 0.6); text-align: center;">
          +${pdfResources.length - 3} more materials
        </div>
      ` : ''}
    </div>
  `;
}

// Enroll in course
async function enrollInCourse(courseId) {
  const token = localStorage.getItem('ocms_token') || localStorage.getItem('token');
  const course = allCourses.find(c => c.id === parseInt(courseId));

  if (!course) {
    showInlineMessage('Course not found. Please refresh the page and try again.', 'error');
    return;
  }

  if (!token) {
    // Always redirect to login first, regardless of course type
    // Pass course info as URL parameters for post-login enrollment
    const loginUrl = `../auth/login.html?enroll=true&courseId=${courseId}&courseName=${encodeURIComponent(course.title)}${course.price ? `&price=${course.price}` : ''}`;
    window.location.href = loginUrl;
    return;
  }

  // User is logged in - check if course requires payment
  if (course && course.price && course.price > 0) {
    // Validate course still exists and is accessible
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        showInlineMessage('Course is no longer available. Please refresh the page.', 'error');
        return;
      }
      const courseData = await response.json();
      if (!courseData.is_published) {
        showInlineMessage('This course is currently unavailable.', 'error');
        return;
      }
    } catch (error) {
      showInlineMessage('Unable to verify course availability. Please try again.', 'error');
      return;
    }
    
    // Paid course - redirect to payment
    if (course.zoom_link) {
      localStorage.setItem('payment_return_url', course.zoom_link);
    }
    window.location.href = `payment.html?courseId=${courseId}&courseName=${encodeURIComponent(course.title)}&price=${course.price}`;
    return;
  }

  // Free course - enroll directly
  await processEnrollment(courseId);
}

// Process enrollment after confirmation
async function processEnrollment(courseId) {
  const course = allCourses.find(c => c.id === parseInt(courseId));
  const token = localStorage.getItem('ocms_token');

  try {
    const response = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: parseInt(courseId) })
    });

    if (response.ok) {
      enrolledCourseIds.add(parseInt(courseId));
      showInlineMessage('Successfully enrolled! You can now access the course.', 'success');

      // Re-render courses
      programs.forEach(program => {
        const course = allCourses.find(c => c.id === parseInt(courseId));
        if (course && course.program === program) {
          renderProgramCourses(program);
        }
      });
      if (course && course.program === 'ADVANCED') {
        renderAdvancedCourses();
      }
    } else {
      const error = await response.json();
      showInlineMessage(error.message || 'Failed to enroll in course', 'error');
    }
  } catch (error) {
    console.error('Enrollment error:', error);
    showInlineMessage('Failed to enroll. Please try again.', 'error');
  }
}

// Show enrollment confirmation modal
function showEnrollmentConfirmationModal(course) {
  currentEnrollmentCourse = course;
  // Create modal if it doesn't exist
  let modal = document.getElementById('enrollmentModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'enrollmentModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h2>Confirm Enrollment</h2>
          <span class="close-modal" onclick="closeEnrollmentModal()">&times;</span>
        </div>
        <div class="modal-body">
          <div class="enrollment-summary">
            <div class="course-info">
              <h3 id="confirmCourseTitle"></h3>
              <div class="instructor-info">
                <span>👨‍🏫 Instructor: <span id="confirmInstructor"></span></span>
              </div>
              <div class="course-details">
                <span>⏱️ Duration: <span id="confirmDuration"></span></span>
                <span>📁 Category: <span id="confirmCategory"></span></span>
                <span>🌐 Language: <span id="confirmLanguage"></span></span>
              </div>
              <div class="price-info">
                <strong>💰 Price: <span id="confirmPrice"></span></strong>
              </div>
            </div>

            <div class="enrollment-benefits">
              <h4>What you'll get:</h4>
              <ul>
                <li>📚 Access to all course materials</li>
                <li>🎥 Live Zoom sessions (if applicable)</li>
                <li>📝 Interactive assignments</li>
                <li>🎓 Certificate upon completion</li>
                <li>💬 Community support</li>
              </ul>
            </div>

            <div class="payment-methods" id="paymentMethodsSection" style="display: none;">
              <h4>Choose Payment Method:</h4>
              <div class="payment-options">
                <label class="payment-option">
                  <input type="radio" name="paymentMethod" value="esewa" checked>
                  <span>💳 eSewa</span>
                </label>
                <label class="payment-option">
                  <input type="radio" name="paymentMethod" value="bank">
                  <span>🏦 Bank Transfer</span>
                </label>
                <label class="payment-option">
                  <input type="radio" name="paymentMethod" value="cash">
                  <span>💵 Cash (Admin Approval)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeEnrollmentModal()">Cancel</button>
          <button class="btn btn-primary" id="confirmEnrollBtn" onclick="confirmEnrollment()">
            <span id="confirmBtnText">Confirm Enrollment</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
      .enrollment-summary { padding: 20px 0; }
      .course-info { margin-bottom: 24px; padding: 20px; background: rgba(34, 197, 94, 0.1); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2); }
      .course-info h3 { margin: 0 0 12px 0; color: #fff; font-size: 20px; }
      .instructor-info, .course-details, .price-info { margin: 8px 0; color: rgba(255, 255, 255, 0.9); }
      .course-details { display: flex; flex-direction: column; gap: 4px; }
      .price-info { font-size: 18px; color: #22c55e; margin-top: 12px; }
      .enrollment-benefits { margin-bottom: 24px; }
      .enrollment-benefits h4 { margin-bottom: 12px; color: #fff; }
      .enrollment-benefits ul { list-style: none; padding: 0; }
      .enrollment-benefits li { padding: 6px 0; color: rgba(255, 255, 255, 0.8); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
      .payment-options { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
      .payment-option { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; cursor: pointer; transition: all 0.2s; }
      .payment-option:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); }
      .payment-option input[type="radio"] { margin: 0; }
      .payment-option span { font-weight: 500; }
    `;
    document.head.appendChild(style);
  }

  // Populate modal with course data
  document.getElementById('confirmCourseTitle').textContent = course.title;
  document.getElementById('confirmInstructor').textContent = course.instructor?.first_name && course.instructor?.last_name
    ? `${course.instructor.first_name} ${course.instructor.last_name}`
    : course.instructor?.email || 'Qualified Instructor';
  document.getElementById('confirmDuration').textContent = course.duration_weeks ? `${course.duration_weeks} weeks` : '8 weeks';
  document.getElementById('confirmCategory').textContent = course.category || 'Technology';
  document.getElementById('confirmLanguage').textContent = course.language || 'English';
  document.getElementById('confirmPrice').textContent = course.price ? `NPR ${parseFloat(course.price).toLocaleString()}` : 'Free';

  // Show payment methods if course has price
  const paymentSection = document.getElementById('paymentMethodsSection');
  const confirmBtn = document.getElementById('confirmEnrollBtn');
  const confirmBtnText = document.getElementById('confirmBtnText');

  if (course.price && course.price > 0) {
    paymentSection.style.display = 'block';
    confirmBtnText.textContent = 'Proceed to Payment';
    confirmBtn.dataset.courseId = course.id;
    confirmBtn.dataset.hasPrice = 'true';
  } else {
    paymentSection.style.display = 'none';
    confirmBtnText.textContent = 'Enroll Now';
    confirmBtn.dataset.courseId = course.id;
    confirmBtn.dataset.hasPrice = 'false';
  }

  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Close enrollment modal
function closeEnrollmentModal() {
  const modal = document.getElementById('enrollmentModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Confirm enrollment from modal
function confirmEnrollment() {
  const confirmBtn = document.getElementById('confirmEnrollBtn');
  const courseId = confirmBtn.dataset.courseId;
  const hasPrice = confirmBtn.dataset.hasPrice === 'true';
  const course = currentEnrollmentCourse || allCourses.find(c => c.id === parseInt(courseId));

  if (!course) {
    showInlineMessage('Course not found', 'error');
    return;
  }

  if (hasPrice) {
    // Get selected payment method
    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = selectedPayment ? selectedPayment.value : 'esewa';

    // Redirect to payment with selected method
    window.location.href = `payment.html?courseId=${courseId}&courseName=${encodeURIComponent(course.title)}&price=${course.price}&paymentMethod=${paymentMethod}`;
  } else {
    // Free course - enroll directly
    closeEnrollmentModal();
    processEnrollment(courseId);
  }
}

// View course details
function viewCourseDetails(courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;
  
  const instructor = course.instructor?.first_name && course.instructor?.last_name 
    ? `${course.instructor.first_name} ${course.instructor.last_name}`
    : course.instructor?.email || 'Unknown';
  
  alert(`
📚 ${course.title}

👨‍🏫 Instructor: ${instructor}
💰 Price: ${course.price ? 'NPR ' + course.price : 'Free'}
📊 Level: ${course.level || 'BEGINNER'}
⏱️ Duration: ${course.duration_weeks ? course.duration_weeks + ' weeks' : 'Self-paced'}
🏫 Program: ${course.program || 'General'} - Semester ${course.semester || 'N/A'}

📝 Description:
${course.description || 'No description available'}

${course.learning_outcomes && course.learning_outcomes.length > 0 ? '\n🎯 What you will learn:\n• ' + course.learning_outcomes.join('\n• ') : ''}
  `);
}

// View PDF
function viewPDF(url, title) {
  window.open(url, '_blank');
}

// Utility function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Check for enrollment success from URL
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('enrolled') === 'true') {
    setTimeout(() => {
      alert('🎉 Payment successful! You are now enrolled in the course.');
    }, 500);
  }
});

// Render advanced courses
function renderAdvancedCourses() {
  const container = document.getElementById('advanced-courses');
  if (!container) return;

  const advancedCourses = allCourses.filter(course => course.program === 'ADVANCED');

  if (advancedCourses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🚀 Advanced courses coming soon</h3>
        <p>We're preparing cutting-edge technology courses with live Zoom sessions.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = advancedCourses.map(course => createAdvancedCourseCard(course)).join('');

  // Add event listeners to enroll buttons
  container.querySelectorAll('[data-enroll-id]').forEach(btn => {
    btn.addEventListener('click', () => enrollInCourse(btn.dataset.enrollId));
  });
}

// Create advanced course card HTML
function createAdvancedCourseCard(course) {
  const isEnrolled = enrolledCourseIds.has(course.id);
  const price = course.price ? `NPR ${parseFloat(course.price).toLocaleString()}` : 'Free';
  const level = course.level || 'BEGINNER';
  const instructor = course.instructor?.first_name && course.instructor?.last_name
    ? `${course.instructor.first_name} ${course.instructor.last_name}`
    : course.instructor?.email || 'Qualified Instructor';
  const duration = course.duration_weeks ? `${course.duration_weeks} weeks` : '8 weeks';

  return `
    <div class="card" data-course-id="${course.id}">
      <div style="margin-bottom: 12px;">
        <span style="display: inline-block; padding: 4px 12px; background: rgba(168, 85, 247, 0.3); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 6px; font-size: 12px; font-weight: 600; color: #c084fc;">
          ${level}
        </span>
        ${course.hasZoom ? `
          <span style="display: inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.3); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 6px; font-size: 12px; font-weight: 600; color: #86efac; margin-left: 8px;">
            🎥 Live Zoom Sessions
          </span>
        ` : ''}
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

      ${course.promo_video_url ? `
        <div style="margin: 12px 0;">
          <iframe width="100%" height="200" src="https://www.youtube.com/embed/${getYouTubeVideoId(course.promo_video_url)}" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
        </div>
      ` : ''}

      <div class="course-meta">
        <span>⏱️ ${duration}</span>
        <span>📁 ${escapeHtml(course.category || 'Technology')}</span>
        <span>🌐 ${escapeHtml(course.language || 'English')}</span>
      </div>

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
    </div>
  `;
}

// Open course resource (notes, board, preboard)
function openCourseResource(courseId, courseName, resourceType) {
  const token = localStorage.getItem('ocms_token') || localStorage.getItem('token');
  
  if (!token) {
    alert('Please login to access resources');
    window.location.href = '../auth/login.html';
    return;
  }

  // Redirect to course resources page
  window.location.href = `course-resources.html?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&type=${resourceType}`;
}

// Modal and Inline Message Functions
function showCourseDetails(courseId) {
  const modal = document.getElementById('courseModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalInstructor = document.getElementById('modalInstructor');
  const modalDetails = document.getElementById('modalDetails');

  // Course details data
  const courseData = {
    'adv-1': {
      title: 'UI/UX Design Masterclass',
      description: 'Master the art of user interface and user experience design. Learn modern design principles, prototyping tools, and create stunning digital experiences that users love.',
      instructor: 'Sarah Johnson',
      details: 'Duration: 8 weeks | Level: Intermediate | Prerequisites: Basic design knowledge | Includes: Figma, Adobe XD, User Research, Prototyping'
    },
    'adv-2': {
      title: 'React.js Development Bootcamp',
      description: 'Become a proficient React developer. Learn component-based architecture, state management, hooks, and build modern web applications with React.',
      instructor: 'Michael Chen',
      details: 'Duration: 10 weeks | Level: Intermediate | Prerequisites: HTML, CSS, JavaScript | Includes: React Hooks, Redux, React Router, Testing'
    },
    'adv-3': {
      title: 'Node.js Backend Development',
      description: 'Build robust backend applications with Node.js. Learn server-side JavaScript, API development, database integration, and deployment strategies.',
      instructor: 'David Rodriguez',
      details: 'Duration: 9 weeks | Level: Intermediate | Prerequisites: JavaScript fundamentals | Includes: Express.js, MongoDB, Authentication, REST APIs'
    },
    'adv-4': {
      title: 'Python with Django Framework',
      description: 'Develop full-stack web applications using Python and Django. Learn MVC architecture, ORM, authentication, and deployment.',
      instructor: 'Emma Thompson',
      details: 'Duration: 8 weeks | Level: Intermediate | Prerequisites: Python basics | Includes: Django ORM, Templates, Authentication, Deployment'
    },
    'adv-5': {
      title: 'Artificial Intelligence & Machine Learning',
      description: 'Dive into the world of AI and ML. Learn machine learning algorithms, neural networks, and build intelligent applications.',
      instructor: 'Dr. Robert Kim',
      details: 'Duration: 12 weeks | Level: Advanced | Prerequisites: Python, Statistics | Includes: TensorFlow, Scikit-learn, Neural Networks, Deep Learning'
    }
  };

  const course = courseData[courseId];
  if (course) {
    modalTitle.textContent = course.title;
    modalDescription.textContent = course.description;
    modalInstructor.textContent = course.instructor;
    modalDetails.textContent = course.details;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeModal() {
  const modal = document.getElementById('courseModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('courseModal');
  if (event.target === modal) {
    closeModal();
  }
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

// Enroll in advanced course
async function enrollAdvancedCourse(courseId, courseName, price) {
  const token = localStorage.getItem('ocms_token');
  
  if (!token) {
    // Show inline message instead of alert
    showInlineMessage('Please login to enroll in courses', 'info');
    // Redirect to login with return URL after a short delay
    setTimeout(() => {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `../auth/login.html?returnUrl=${returnUrl}&enrollCourse=${courseId}&courseName=${encodeURIComponent(courseName)}&price=${price}`;
    }, 2000);
    return;
  }

  // Fetch course details to get zoom_link
  try {
    const response = await fetch(`${API_URL}/courses/${courseId}`);
    if (response.ok) {
      const course = await response.json();
      if (course.zoom_link) {
        localStorage.setItem('payment_return_url', course.zoom_link);
      }
    }
  } catch (error) {
    console.error('Failed to fetch course details:', error);
  }

  // Create course object for modal
  const courseDetails = {
    '1001': { instructor: 'Sarah Johnson', duration_weeks: 8, category: 'Design', language: 'English' },
    '1002': { instructor: 'Mike Chen', duration_weeks: 12, category: 'Web Development', language: 'English' },
    '1003': { instructor: 'Alex Rodriguez', duration_weeks: 10, category: 'Backend Development', language: 'English' },
    '1004': { instructor: 'Emma Davis', duration_weeks: 10, category: 'Python Development', language: 'English' },
    '1005': { instructor: 'Dr. James Wilson', duration_weeks: 14, category: 'AI/ML', language: 'English' }
  };

  const details = courseDetails[courseId] || { instructor: 'Qualified Instructor', duration_weeks: 8, category: 'Technology', language: 'English' };

  const course = {
    id: courseId,
    title: courseName,
    price: price,
    instructor: { first_name: details.instructor.split(' ')[0], last_name: details.instructor.split(' ').slice(1).join(' ') || '' },
    duration_weeks: details.duration_weeks,
    category: details.category,
    language: details.language
  };

  // Show enrollment confirmation modal
  showEnrollmentConfirmationModal(course);
}



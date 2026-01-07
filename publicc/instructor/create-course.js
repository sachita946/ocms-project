// Course Creation Form Handler
import { courseService } from '../js/api-service.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROUTES } from '../js/constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createCourseForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('courseTitle');
    const desc = document.getElementById('courseDescription');
    const url = document.getElementById('courseURL');

    const titleError = document.getElementById('courseTitleError');
    const descError = document.getElementById('courseDescriptionError');
    const urlError = document.getElementById('courseURLError');
    const msg = document.getElementById('courseMsg');

    // Clear previous messages
    titleError.textContent = descError.textContent = urlError.textContent = msg.textContent = '';

    let valid = true;
    if(!title.value.trim()){ titleError.textContent = ERROR_MESSAGES.REQUIRED_FIELD; valid = false; }
    if(!desc.value.trim()){ descError.textContent = ERROR_MESSAGES.REQUIRED_FIELD; valid = false; }
    if(!url.value || !/^https?:\/\/\S+\.\S+$/.test(url.value)){ urlError.textContent = ERROR_MESSAGES.INVALID_URL; valid = false; }

    if(!valid) return;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Course...';

    try {
      const courseData = {
        title: title.value.trim(),
        description: desc.value.trim(),
        thumbnail_url: url.value.trim(),
        category: 'General',
        level: 'BEGINNER',
        price: 0
      };

      const data = await courseService.createCourse(courseData);

      msg.textContent = SUCCESS_MESSAGES.COURSE_CREATED;
      msg.style.color = "var(--color-success)";

      // Reset form and redirect after delay
      form.reset();
      setTimeout(() => {
        window.location.href = ROUTES.INSTRUCTOR_DASHBOARD;
      }, 1500);

    } catch (error) {
      msg.textContent = error.message || ERROR_MESSAGES.INTERNAL_ERROR;
      msg.style.color = "var(--color-error)";
      console.error('Course creation error:', error);
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

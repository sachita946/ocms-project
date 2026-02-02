// Course Creation Form Handler
import { courseService } from '../js/api-service.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROUTES } from '../js/constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createCourseForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const category = document.getElementById('category');
    const level = document.getElementById('level');
    const price = document.getElementById('price');
    const thumbnail_url = document.getElementById('thumbnail_url');
    const duration = document.getElementById('duration');
    const language = document.getElementById('language');
    const requirements = document.getElementById('requirements');
    const zoom_link = document.getElementById('zoom_link');

    const msg = document.getElementById('alertMessage');

    // Clear previous messages
    msg.textContent = '';
    msg.className = 'alert';

    let valid = true;
    if(!title.value.trim()){ showError('title', 'Course title is required'); valid = false; }
    if(!description.value.trim()){ showError('description', 'Course description is required'); valid = false; }
    if(!category.value){ showError('category', 'Course category is required'); valid = false; }
    if(!level.value){ showError('level', 'Course level is required'); valid = false; }
    if(price.value === '' || price.value < 0){ showError('price', 'Valid price is required'); valid = false; }

    if(!valid) return;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Course...';

    try {
      const courseData = {
        title: title.value.trim(),
        description: description.value.trim(),
        category: category.value,
        level: level.value,
        price: parseFloat(price.value),
        thumbnail_url: thumbnail_url.value.trim() || null,
        duration_weeks: duration.value ? parseInt(duration.value) : null,
        language: language.value || 'English',
        requirements: requirements.value.trim() ? requirements.value.trim().split('\n') : [],
        zoom_link: zoom_link.value.trim() || null
      };

      const data = await courseService.createCourse(courseData);

      msg.textContent = SUCCESS_MESSAGES.COURSE_CREATED;
      msg.className = 'alert alert-success';
      msg.style.display = 'block';

      // Reset form and redirect after delay
      form.reset();
      setTimeout(() => {
        window.location.href = 'instructor-dashboard.html';
      }, 1500);

    } catch (error) {
      msg.textContent = error.message || ERROR_MESSAGES.INTERNAL_ERROR;
      msg.className = 'alert alert-error';
      msg.style.display = 'block';
      console.error('Course creation error:', error);
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
  }
  const msg = document.getElementById('alertMessage');
  msg.textContent = message;
  msg.className = 'alert alert-error';
  msg.style.display = 'block';
}

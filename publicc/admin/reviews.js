

initAdminPage();

const token = localStorage.getItem('ocms_token');

// Load reviews on page load
document.addEventListener('DOMContentLoaded', loadReviews);

// Navigation
document.querySelectorAll('[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});

// Load Reviews
async function loadReviews() {
  try {
    const data = await fetchAPI('/api/admin/reviews');
    if (!data) return;
    renderReviews(data.reviews || []);
  } catch (err) {
    console.error(err);
  }
}

// Render Reviews
function renderReviews(reviews = []) {
  const list = document.getElementById('reviews-list');
  const empty = document.getElementById('reviews-empty');

  list.innerHTML = '';

  if (!reviews.length) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'block';

  reviews.forEach(review => {
    const student = review.student ? `${review.student.first_name} ${review.student.last_name}` : 'Anonymous';
    const course = review.course?.title || 'Unknown Course';

    const card = `
      <div class="review-card">
        <div class="review-header">
          <div class="review-meta">
            <h4>📕 ${course}</h4>
            <p><strong>By:</strong> ${student}</p>
          </div>
          <div class="review-rating">${stars(review.rating)}</div>
        </div>
        <div class="review-content">
          ${review.comment || 'No comment provided'}
        </div>
        <div class="review-actions">
          <button class="action-btn" onclick="approveReview('${review.id}')">Approve</button>
          <button class="action-btn action-btn-danger" onclick="deleteReview('${review.id}')">Delete</button>
        </div>
      </div>
    `;
    list.innerHTML += card;
  });
}

// Action handlers
function approveReview(reviewId) {
  alert(`Approve review ${reviewId} - Feature coming soon`);
}

function deleteReview(reviewId) {
  if (confirm('Are you sure you want to delete this review?')) {
    alert(`Delete review ${reviewId} - Feature coming soon`);
  }
}

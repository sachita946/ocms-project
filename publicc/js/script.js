const apiBaseUrl = 'http://localhost:3000/api/signup';
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });
}

// ==============================
// COURSE PROGRESS BUTTON
// ==============================
const progressButtons = document.querySelectorAll(".progress-btn");

progressButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const course = btn.closest(".course");
    const progressBar = course.querySelector(".progress");
    let width = parseInt(progressBar.style.width) || 0;
    if (width < 100) {
      width += 20; // increment by 20%
      if(width > 100) width = 100;
      progressBar.style.width = width + "%";
    }
  });
});

// ==============================
// STAR RATING INTERACTION
// ==============================
const allCourses = document.querySelectorAll(".course");

allCourses.forEach(course => {
  const stars = course.querySelectorAll(".rating span");
  const textarea = course.querySelector("textarea");
  const submitBtn = course.querySelector(".submit-review");
  const reviewList = course.querySelector(".review-list");
  let selectedRating = 0;

  stars.forEach((star, index) => {
    star.addEventListener("mouseover", () => {
      highlightStars(index);
    });

    star.addEventListener("mouseout", () => {
      highlightStars(selectedRating - 1);
    });

    star.addEventListener("click", () => {
      selectedRating = index + 1;
      highlightStars(index);
    });
  });

  function highlightStars(index) {
    stars.forEach((star, i) => {
      star.style.color = i <= index ? "#ffb400" : "#ccc";
    });
  }

  // ==============================
  // SUBMIT REVIEW
  // ==============================
  submitBtn.addEventListener("click", () => {
    const reviewText = textarea.value.trim();
    if (!reviewText) {
      alert("Please write a review before submitting!");
      return;
    }
    const li = document.createElement("li");
    li.innerHTML = `${reviewText} <strong>- Rating: ${selectedRating}/5</strong>`;
    reviewList.appendChild(li);
    textarea.value = "";
    selectedRating = 0;
    highlightStars(-1);
  });
  // Footer tab switching logic
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active from all
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));

    // Activate clicked one
    btn.classList.add("active");
    const target = document.getElementById(btn.dataset.tab);
    target.classList.add("active");
  });
});

});

// script.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Highlight active link
  const navLinks = document.querySelectorAll("nav ul li a");
  const currentPath = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });

  // 2. Hero button click animations
  const heroButtons = document.querySelectorAll(".hero-buttons .btn");
  heroButtons.forEach(btn => {
    btn.addEventListener("mouseenter", () => btn.classList.add("hover"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("hover"));
  });

  // 3. Team member hover effect
  const teamMembers = document.querySelectorAll(".team-member");
  teamMembers.forEach(member => {
    member.addEventListener("mouseenter", () => member.classList.add("hover"));
    member.addEventListener("mouseleave", () => member.classList.remove("hover"));
  });

  // 4. Footer social buttons
  const footerBtns = document.querySelectorAll(".footer-buttons button");
  footerBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const platform = btn.textContent.toLowerCase();
      let url = "#";
      switch(platform){
        case "facebook": url = "https://facebook.com"; break;
        case "twitter": url = "https://twitter.com"; break;
        case "linkedin": url = "https://linkedin.com"; break;
        case "instagram": url = "https://instagram.com"; break;
      }
      window.open(url, "_blank");
    });
    btn.addEventListener("mouseenter", () => btn.classList.add("hover"));
    btn.addEventListener("mouseleave", () => btn.classList.remove("hover"));
  });

  // 5. Optional: welcome alert for dashboard
  if (currentPath.includes("dashboard.html")) {
    console.log("Welcome to EduVerse Dashboard!");
    // Or you can show a small toast / alert
    
    // alert("Welcome to EduVerse Dashboard!");
  }
});

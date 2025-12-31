const form = document.getElementById('studentForm');

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  input.classList.add("error-input");
  input.classList.remove("success-input");

  error.textContent = message;
  error.style.opacity = "1";
}

function showSuccess(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  input.classList.remove("error-input");
  input.classList.add("success-input");

  error.textContent = "";
  error.style.opacity = "0";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let valid = true;

  const name = studentName.value.trim();
  const email = studentEmail.value.trim();
  const password = studentPassword.value.trim();
  const confirm = studentConfirmPassword.value.trim();

  // Full Name Validation
  if (!name) {
    valid = false;
    showError("studentName", "errName", "Full name is required.");
  } else {
    showSuccess("studentName", "errName");
  }

  // Email Validation
  if (!email) {
    valid = false;
    showError("studentEmail", "errEmail", "Email is required.");
  } else {
    showSuccess("studentEmail", "errEmail");
  }

  // Password
  if (password.length < 6) {
    valid = false;
    showError("studentPassword", "errPass", "Password must be at least 6 characters.");
  } else {
    showSuccess("studentPassword", "errPass");
  }

  if (password !== confirm) {
    valid = false;
    showError("studentConfirmPassword", "errCPass", "Passwords do not match.");
  } else {
    showSuccess("studentConfirmPassword", "errCPass");
  }

  if (!valid) return;

  // Submit to backend
  const payload = {
    full_name: name,
    email,
    password,
    phone: studentPhone.value,
    bio: studentBio.value,
    current_education_level: studentEducation.value,
    interests: studentSkills.value.split(',').map(s => s.trim()),
  };

  try {
    const res = await fetch("http://localhost:5000/api/student/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      // Redirect to dashboard
      window.location.href = "/dashboard/student.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert("Cannot connect to server!");
  }
});

// Instructor Signup Form Handler
document.getElementById('instructorForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous errors
  document.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });

  // Collect form data
  const formData = {
    first_name: document.getElementById('instructorName').value.trim(),
    last_name: '', // Will be parsed from full name
    full_name: document.getElementById('instructorName').value.trim(),
    email: document.getElementById('instructorEmail').value.trim(),
    password: document.getElementById('instructorPassword').value,
    role: 'INSTRUCTOR',
    // Additional instructor fields
    qualifications: document.getElementById('instructorEducation').value.trim(),
    experience_years: parseInt(document.getElementById('instructorExperience').value) || null,
    expertise_area: document.getElementById('instructorSubjects').value.trim(),
    bio: document.getElementById('instructorBio').value.trim(),
    phone: document.getElementById('instructorPhone').value.trim(),
    website: document.getElementById('instructorWebsite').value.trim() || document.getElementById('instructorGitHub').value.trim()
  };

  // Basic validation
  let hasErrors = false;

  if (!formData.first_name) {
    showError('errName', 'Full name is required');
    hasErrors = true;
  }

  if (!formData.email) {
    showError('errEmail', 'Email is required');
    hasErrors = true;
  }

  if (!formData.password) {
    showError('errPassword', 'Password is required');
    hasErrors = true;
  }

  if (formData.password !== document.getElementById('instructorConfirmPassword').value) {
    showError('errConfirmPassword', 'Passwords do not match');
    hasErrors = true;
  }

  if (!formData.qualifications) {
    showError('errEducation', 'Educational qualification is required');
    hasErrors = true;
  }

  if (!formData.experience_years || formData.experience_years < 0) {
    showError('errExperience', 'Valid experience in years is required');
    hasErrors = true;
  }

  if (hasErrors) return;

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Instructor account created successfully! Your application is pending admin approval.');
      window.location.href = 'login.html';
    } else {
      if (result.message.includes('email')) {
        showError('errEmail', result.message);
      } else {
        alert(result.message || 'Signup failed');
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('Network error. Please try again.');
  }
});

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.display = 'block';
}

// Form reset function
function resetForm() {
  document.getElementById('instructorForm').reset();
  document.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}
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
    const res = await fetch("http://localhost:5500/api/auth/signup", {
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
// / Student Signup Validation and Submission
// document.addEventListener('DOMContentLoaded', function() {
//   const form = document.getElementById('studentForm');
//   const submitBtn = form.querySelector('button[type="submit"]');

//   // Get URL parameters for course enrollment
//   const urlParams = new URLSearchParams(window.location.search);
//   const courseId = urlParams.get('courseId');
//   const courseName = urlParams.get('courseName');
//   const price = urlParams.get('price');

//   // Show enrollment notice if coming from course enrollment
//   if (courseId && courseName) {
//     const notice = document.createElement('div');
//     notice.style.cssText = `
//       background: rgba(34, 197, 94, 0.1);
//       border: 1px solid rgba(34, 197, 94, 0.3);
//       border-radius: 8px;
//       padding: 16px;
//       margin-bottom: 24px;
//       color: #86efac;
//       font-weight: 500;
//     `;
//     notice.innerHTML = `
//       <strong>📚 Course Enrollment:</strong> You're signing up to enroll in "${courseName}"
//       ${price ? `for NPR ${parseFloat(price).toLocaleString()}` : '(Free Course)'}
//     `;
//     form.parentNode.insertBefore(notice, form);
//   }

//   // Real-time validation
//   const inputs = form.querySelectorAll('input, select, textarea');
//   inputs.forEach(input => {
//     input.addEventListener('blur', () => validateField(input));
//     input.addEventListener('input', () => {
//       if (input.classList.contains('error')) {
//         validateField(input);
//       }
//     });
//   });

//   // Form submission
//   form.addEventListener('submit', async function(e) {
//     e.preventDefault();

//     // Validate all fields
//     let isValid = true;
//     inputs.forEach(input => {
//       if (!validateField(input)) {
//         isValid = false;
//       }
//     });

//     if (!isValid) {
//       showMessage('Please fix the errors above', 'error');
//       return;
//     }

//     // Show loading state
//     submitBtn.disabled = true;
//     submitBtn.textContent = 'Creating Account...';
//     showMessage('Creating your account...', 'info');

//     try {
//       const formData = new FormData();

//       // Basic fields
//       formData.append('first_name', document.getElementById('studentName').value.split(' ')[0] || '');
//       formData.append('last_name', document.getElementById('studentName').value.split(' ').slice(1).join(' ') || '');
//       formData.append('email', document.getElementById('studentEmail').value);
//       formData.append('password', document.getElementById('studentPassword').value);
//       formData.append('phone', document.getElementById('studentPhone').value || '');
//       formData.append('address', document.getElementById('studentAddress').value || '');
//       formData.append('country', document.getElementById('studentCountry').value || '');
//       formData.append('city', document.getElementById('studentCity').value || '');
//       formData.append('postal_code', document.getElementById('studentPostal').value || '');
//       formData.append('gender', document.getElementById('studentGender').value || '');
//       formData.append('date_of_birth', document.getElementById('studentDob').value || '');
//       formData.append('father_name', document.getElementById('studentFatherName').value || '');
//       formData.append('mother_name', document.getElementById('studentMotherName').value || '');
//       formData.append('education_level', document.getElementById('studentEducation').value || '');
//       formData.append('skills', document.getElementById('studentSkills').value || '');
//       formData.append('hobbies', document.getElementById('studentHobbies').value || '');
//       formData.append('linkedin_profile', document.getElementById('studentLinkedIn').value || '');
//       formData.append('github_profile', document.getElementById('studentGitHub').value || '');
//       formData.append('bio', document.getElementById('studentBio').value || '');

//       // File uploads
//       const profileFile = document.getElementById('studentProfileFile').files[0];
//       const resumeFile = document.getElementById('studentResumeFile').files[0];

//       if (profileFile) formData.append('profile_image', profileFile);
//       if (resumeFile) formData.append('resume', resumeFile);

//       const response = await fetch('http://localhost:5000/api/auth/register/student', {
//         method: 'POST',
//         body: formData
//       });

//       const result = await response.json();

//       if (response.ok) {
//         // Store token
//         localStorage.setItem('token', result.token);
//         localStorage.setItem('user', JSON.stringify(result.user));

//         showMessage('Account created successfully!', 'success');

//         // If coming from course enrollment, redirect to payment
//         if (courseId && price && parseFloat(price) > 0) {
//           setTimeout(() => {
//             window.location.href = `payment.html?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}&price=${price}`;
//           }, 1500);
//         } else if (courseId) {
//           // Free course - enroll directly
//           try {
//             const enrollResponse = await fetch('http://localhost:5000/api/enrollments', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${result.token}`
//               },
//               body: JSON.stringify({ course_id: parseInt(courseId) })
//             });

//             if (enrollResponse.ok) {
//               showMessage('Successfully enrolled in the course!', 'success');
//               setTimeout(() => {
//                 window.location.href = `courses-lessons.html?courseId=${courseId}`;
//               }, 1500);
//             } else {
//               showMessage('Account created but enrollment failed. Please try enrolling again.', 'warning');
//               setTimeout(() => {
//                 window.location.href = 'courses.html';
//               }, 2000);
//             }
//           } catch (enrollError) {
//             console.error('Enrollment error:', enrollError);
//             showMessage('Account created but enrollment failed. Please try enrolling again.', 'warning');
//             setTimeout(() => {
//               window.location.href = 'courses.html';
//             }, 2000);
//           }
//         } else {
//           // Regular signup
//           setTimeout(() => {
//             window.location.href = 'courses.html';
//           }, 1500);
//         }
//       } else {
//         showMessage(result.message || 'Failed to create account', 'error');
//         submitBtn.disabled = false;
//         submitBtn.textContent = 'Create Student Account';
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       showMessage('Network error. Please try again.', 'error');
//       submitBtn.disabled = false;
//       submitBtn.textContent = 'Create Student Account';
//     }
//   });
// });

// // Field validation function
// function validateField(input) {
//   const value = input.value.trim();
//   const errorElement = document.getElementById('err' + input.id.replace('student', '').replace(/^\w/, c => c.toUpperCase()));
//   let isValid = true;
//   let message = '';

//   switch(input.id) {
//     case 'studentName':
//       if (!value) {
//         message = 'Full name is required';
//         isValid = false;
//       } else if (value.length < 2) {
//         message = 'Name must be at least 2 characters';
//         isValid = false;
//       }
//       break;

//     case 'studentEmail':
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!value) {
//         message = 'Email is required';
//         isValid = false;
//       } else if (!emailRegex.test(value)) {
//         message = 'Please enter a valid email address';
//         isValid = false;
//       }
//       break;

//     case 'studentPassword':
//       if (!value) {
//         message = 'Password is required';
//         isValid = false;
//       } else if (value.length < 8) {
//         message = 'Password must be at least 8 characters';
//         isValid = false;
//       } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
//         message = 'Password must contain uppercase, lowercase, and number';
//         isValid = false;
//       }
//       break;

//     case 'studentConfirmPassword':
//       const password = document.getElementById('studentPassword').value;
//       if (!value) {
//         message = 'Please confirm your password';
//         isValid = false;
//       } else if (value !== password) {
//         message = 'Passwords do not match';
//         isValid = false;
//       }
//       break;

//     case 'studentPhone':
//       if (value && !/^[\+]?[0-9\-\s]{10,}$/.test(value.replace(/\s/g, ''))) {
//         message = 'Please enter a valid phone number';
//         isValid = false;
//       }
//       break;

//     case 'studentPostal':
//       if (value && !/^[0-9]{4,10}$/.test(value)) {
//         message = 'Please enter a valid postal code';
//         isValid = false;
//       }
//       break;

//     case 'studentLinkedIn':
//     case 'studentGitHub':
//       if (value && !/^https?:\/\/.+/.test(value)) {
//         message = 'Please enter a valid URL starting with http:// or https://';
//         isValid = false;
//       }
//       break;
//   }

//   if (errorElement) {
//     errorElement.textContent = message;
//     errorElement.style.display = message ? 'block' : 'none';
//   }

//   input.classList.toggle('error', !isValid);
//   return isValid;
// }

// // Show inline messages
// function showMessage(message, type) {
//   // Remove existing message
//   const existingMessage = document.querySelector('.inline-message');
//   if (existingMessage) {
//     existingMessage.remove();
//   }

//   const messageDiv = document.createElement('div');
//   messageDiv.className = `inline-message ${type}`;
//   messageDiv.style.cssText = `
//     position: fixed;
//     top: 20px;
//     right: 20px;
//     padding: 16px 20px;
//     border-radius: 8px;
//     color: white;
//     font-weight: 500;
//     z-index: 1000;
//     max-width: 400px;
//     box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//     animation: slideIn 0.3s ease;
//   `;

//   switch(type) {
//     case 'success':
//       messageDiv.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
//       break;
//     case 'error':
//       messageDiv.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
//       break;
//     case 'warning':
//       messageDiv.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
//       break;
//     case 'info':
//       messageDiv.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
//       break;
//   }

//   messageDiv.innerHTML = `
//     <div style="display: flex; align-items: center; gap: 8px;">
//       <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
//       <span>${message}</span>
//     </div>
//   `;

//   document.body.appendChild(messageDiv);

//   // Auto remove after 5 seconds for success/info, keep errors/warnings
//   if (type === 'success' || type === 'info') {
//     setTimeout(() => {
//       if (messageDiv.parentNode) {
//         messageDiv.style.animation = 'slideOut 0.3s ease';
//         setTimeout(() => messageDiv.remove(), 300);
//       }
//     }, 5000);
//   }
// }

// // Add slide animations
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes slideIn {
//     from { transform: translateX(100%); opacity: 0; }
//     to { transform: translateX(0); opacity: 1; }
//   }
//   @keyframes slideOut {
//     from { transform: translateX(0); opacity: 1; }
//     to { transform: translateX(100%); opacity: 0; }
//   }
//   .input.error {
//     border-color: #ef4444 !important;
//     background: rgba(239, 68, 68, 0.05) !important;
//   }
// `;
// document.head.appendChild(style);
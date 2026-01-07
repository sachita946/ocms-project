// certificates.js
const token = localStorage.getItem("token");

// Optionally fetch courses for selection
async function loadCourses() {
  const res = await fetch("/api/courses", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const courses = await res.json();
  const courseSelect = document.getElementById("course_id");
  courseSelect.innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}
loadCourses();

async function loadCertificates() {
  const res = await fetch("/api/certificates", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const certificates = await res.json();
  const container = document.getElementById("certificates-container");
  container.innerHTML = "";
  certificates.forEach(cert => {
    container.innerHTML += `
      <div class="certificate-card">
        <p><strong>Student:</strong> ${cert.student.full_name}</p>
        <p><strong>Course:</strong> ${cert.course.title}</p>
        <p><strong>URL:</strong> <a href="${cert.certificate_url}" target="_blank">View</a></p>
        <p><strong>Code:</strong> ${cert.verification_code}</p>
        <button onclick="deleteCertificate(${cert.id})">Delete</button>
      </div>`;
  });
}

async function deleteCertificate(id) {
  await fetch(`/api/certificates/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  loadCertificates();
}

loadCertificates();

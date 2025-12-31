const apiUrl = "http://localhost:3000/api/payments";
document.addEventListener('DOMContentLoaded', () => {
  const payBtn = document.getElementById('payBtn');
  const generateBtn = document.getElementById('generateCertBtn');
  const msg = document.getElementById('paymentMsg');

  const token = localStorage.getItem('token'); // JWT from login
  const courseId = '1'; // example course ID
  const courseName = document.getElementById('courseName').textContent;
  const studentName = localStorage.getItem('userName') || 'Student Name';
  // const hash = crypto.createHash('sha256').update(studentName + courseId + timestamp).digest('hex');

  // Step 1: Pay Now
  payBtn.addEventListener('click', async () => {
    const payment_method = document.getElementById('paymentMethod').value;
    const transaction_id = document.getElementById('transactionId').value;

    if (!transaction_id) return alert('Enter transaction ID');

    try {
      const res = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: courseId,
          amount: parseFloat(document.getElementById('coursePrice').textContent),
          status: 'COMPLETED', // mark as completed after verification
          payment_method,
          transaction_id
        })
      });

      const data = await res.json();
      if (res.ok) {
        msg.textContent = 'Payment successful! You can now generate your certificate.';
        msg.style.color = 'green';
        generateBtn.disabled = false;
      } else {
        msg.textContent = data.message;
        msg.style.color = 'red';
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Payment failed!';
      msg.style.color = 'red';
    }
  });

  // Step 2: Generate Certificate
  generateBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:5000/api/payments/certificate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      });

      const cert = await res.json();
      if (res.ok) {
        // Generate PDF using jsPDF
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('EduVerse Certificate of Completion', 105, 40, null, null, 'center');
        doc.setFontSize(16);
        doc.text('This is to certify that', 105, 60, null, null, 'center');
        doc.setFontSize(18);
        doc.text(studentName, 105, 75, null, null, 'center');
        doc.setFontSize(16);
        doc.text('has successfully completed the course', 105, 90, null, null, 'center');
        doc.setFontSize(18);
        doc.text(courseName, 105, 105, null, null, 'center');
        doc.setFontSize(14);
        doc.text(`Verification Code: ${cert.verification_code}`, 105, 125, null, null, 'center');
        doc.save(`${studentName}-${courseName}-Certificate.pdf`);
      } else {
        alert(cert.message);
      }
    } catch (err) {
      console.error(err);
      alert('Certificate generation failed!');
    }
  });
});


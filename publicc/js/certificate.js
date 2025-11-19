const apiBaseUrl = 'http://localhost:3000/api/certificate';
document.addEventListener('DOMContentLoaded', () => {

  // Certificate filtering
  const certFilters = document.querySelectorAll('.cert-filter button');
  const certificates = document.querySelectorAll('.certificate-card');
  
  if(certFilters.length > 0) {
    certFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        certificates.forEach(cert => {
          if(category === 'all' || cert.dataset.category === category) {
            cert.style.display = 'block';
          } else {
            cert.style.display = 'none';
          }
        });
      });
    });
  }

  // Placeholder download functionality
  certificates.forEach(cert => {
    const downloadBtn = cert.querySelector('.btn');
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Certificate PDF will be downloaded once generated.');
    });
  });

});

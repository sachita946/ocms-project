const apiBaseUrl = 'http://localhost:3000/api/contact';
document.addEventListener('DOMContentLoaded', () => {

  const contactForm = document.querySelector('#contactForm');
  if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');
      const msgBox = contactForm.querySelector('.form-msg');

      // Basic validation
      if(name.value.trim().length < 3) {
        msgBox.textContent = 'Name must be at least 3 characters';
        msgBox.style.color = 'red';
        name.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(email.value)) {
        msgBox.textContent = 'Enter a valid email';
        msgBox.style.color = 'red';
        email.focus();
        return;
      }

      if(message.value.trim().length < 10) {
        msgBox.textContent = 'Message must be at least 10 characters';
        msgBox.style.color = 'red';
        message.focus();
        return;
      }

      // Mock submission
      msgBox.textContent = 'Message sent successfully!';
      msgBox.style.color = 'green';
      contactForm.reset();
    });
  }

});



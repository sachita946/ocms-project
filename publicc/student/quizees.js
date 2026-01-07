const apiBaseUrl = '/api/quizzes';
document.addEventListener('DOMContentLoaded', () => {
  const quizForm = document.getElementById('quizForm');
  if (!quizForm) return;

  quizForm.addEventListener('submit', e => {
    e.preventDefault();
    const answers = quizForm.querySelectorAll('input[type="radio"]:checked');
    const msg = document.getElementById('quizMsg');

    if (answers.length === 0) {
      msg.textContent = 'Please answer all questions.';
      msg.style.color = 'red';
      return;
    }

    // Mock scoring
    let score = 0;
    answers.forEach(ans => { if (ans.dataset.correct === 'true') score++; });

    msg.textContent = `You scored ${score} out of ${quizForm.querySelectorAll('.question').length}`;
    msg.style.color = 'green';
  });
});

const form = document.querySelector('#questionnaire');
const questions = [...form.querySelectorAll('select, input[type="text"], textarea')].filter((field) => field.name !== 'website');
const progressBar = document.querySelector('#progress-bar');
const progressCount = document.querySelector('#progress-count');
const progressLabel = document.querySelector('#progress-label');
const submitButton = document.querySelector('#submit-button');
const successState = document.querySelector('#success-state');

function answeredCount() {
  return questions.filter((field) => field.value.trim()).length;
}

function updateProgress() {
  const answered = answeredCount();
  const percent = Math.round((answered / questions.length) * 100);
  progressBar.style.width = `${percent}%`;
  progressCount.textContent = `${answered} / ${questions.length} answered`;
  progressLabel.textContent = answered === 0 ? 'Getting started' : answered === questions.length ? 'Complete' : 'In progress';
}

questions.forEach((field) => field.addEventListener('input', () => {
  field.classList.remove('invalid');
  updateProgress();
}));
updateProgress();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const requiredFields = [...form.querySelectorAll('[required]')];
  const missing = requiredFields.filter((field) => !field.value.trim());
  requiredFields.forEach((field) => field.classList.toggle('invalid', missing.includes(field)));
  if (missing.length) {
    missing[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    missing[0].focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = 'Saving response… <span aria-hidden="true">↗</span>';
  const answers = Object.fromEntries(questions.map((field) => [field.name, field.value.trim()]));

  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, website: form.elements.website.value }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Submission failed');
    }
    form.hidden = true;
    document.querySelector('.progress-wrap').hidden = true;
    successState.hidden = false;
    successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Try submitting again <span aria-hidden="true">↗</span>';
    alert(error.message || 'We could not save your response. Please check your connection and try again.');
  }
});

const render = (path, value, i18nextInstance) => {
  const rssForm = document.querySelector('form.rss-form');
  if (path === 'rssForm.state') {
    const urlInput = rssForm.querySelector('input[aria-label="url"]');
    const feedbackElement = document.querySelector('.feedback');
    switch (value) {
      case 'invalid':
        urlInput.classList.add('is-invalid');
        feedbackElement.classList.remove('text-success');
        feedbackElement.classList.add('text-danger');
        break;
      case 'valid':
        urlInput.classList.remove('is-invalid');
        feedbackElement.classList.remove('text-danger');
        feedbackElement.classList.add('text-success');
        rssForm.reset();
        urlInput.focus();
        break;
      default:
        throw new Error(`Invalid state: ${value}`);
    }
  } else if (path === 'rssForm.feedbackType') {
    const feedbackElement = document.querySelector('.feedback');
    feedbackElement.textContent = i18nextInstance.t(value);
  }
};

export default render;

export default (elements) => (path, value) => {
  switch (path) {
    case 'form.valid':
      if (value === true) {
        elements.input.classList.remove('is-invalid');
        elements.input.value = '';
        elements.input.focus();
      }
      break;

    case 'form.error':
      elements.input.classList.add('is-invalid');
      break;

    default:
      break;
  }
};

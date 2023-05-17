export default (elements, initialState, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.valid':
      if (value === true) {
        elements.input.classList.remove('is-invalid');
        elements.input.value = '';
        elements.input.focus();
        elements.statusMessage.classList.remove('text-danger');
        elements.statusMessage.classList.add('text-success');
        elements.statusMessage.textContent = i18nInstance.t('formMessage.success');
      }
      break;

    case 'form.error':
      elements.input.classList.add('is-invalid');
      elements.statusMessage.classList.add('text-danger');
      elements.statusMessage.textContent = i18nInstance.t(`formMessage.${initialState.form.error}`);
      break;

    default:
      break;
  }
};

export default (state, elements) => {
  const { input } = elements;
  input.classList.remove('is-invalid');
  if (state.isValid === false) {
    input.classList.add('is-invalid');
    return;
  }
  input.value = '';
  alert('rss загружен');
};

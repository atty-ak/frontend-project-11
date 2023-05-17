import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import render from './view.js';
import resources from './locales/index.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    statusMessage: document.querySelector('.feedback'),
  };

  const initialState = {
    form: {
      valid: false,
      state: 'filling',
      error: null,
    },
    posts: [],
    feeds: [],
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  const validate = (url) => {
    const rssList = state.feeds;
    const schema = yup.string()
      .required()
      .url()
      .notOneOf(rssList);
    return schema.validate(url);
  };

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    validate(url)
      .then(() => {
        state.feeds.push(url);
        state.form.valid = true;
      })
      .catch((error) => {
        state.form.valid = false;
        state.form.error = error.type;
      });
  }));
};

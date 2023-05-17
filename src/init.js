import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
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

  const state = onChange(initialState, render(elements, initialState));

  const validate = (url) => {
    const rssList = state.feeds;
    const schema = yup.string()
      .required()
      .url()
      .notOneOf(rssList);
    return schema.validate(url);
  };

  elements.form.addEventListener('submit', (e) => {
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
        state.form.error = error;
      });
  });
};

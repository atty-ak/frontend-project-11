import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
  };

  const initialState = {
    isValid: false,
    currentUrl: '',
    feedList: [],
    error: null,
  };

  const watchedState = onChange(initialState, (path) => {
    if (path === 'isValid') {
      render(initialState, elements);
    }
  });

  const validate = (url) => {
    const rssList = watchedState.feedList;
    const schema = yup.string()
      .trim()
      .required()
      .url()
      .notOneOf(rssList);
    return schema.validate(url);
  };

  elements.form.addEventListener('submit', (e) => {
    e.prevenetDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    validate(url)
      .then(() => {
        initialState.currentUrl = url;
        initialState.feedList.push(url);
        initialState.isValid = true;
        watchedState.isValid = true;
      })
      .catch((error) => {
        initialState.currentUrl = url;
        initialState.error = error;
        initialState.isValid = false;
        watchedState.isValid = false;
      });
  });
};

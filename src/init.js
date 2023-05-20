import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view.js';
import parseRss from './parser.js';
import resources from './locales/index.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    statusMessage: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const initialState = {
    form: {
      status: 'filling',
      error: null,
    },
    posts: [],
    feeds: [],
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  const validate = (url) => {
    const rssList = state.feeds.map((feed) => feed.url);
    const schema = yup.string()
      .required()
      .url()
      .notOneOf(rssList);
    return schema.validate(url);
  };

  const addPostsID = (posts) => {
    if (posts.length === 0) return [];
    return posts.map((post) => {
      const id = _.uniqueId();
      return { ...post, id };
    });
  };

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const url = data.get('url');
    validate(url)
      .then(() => {
        state.form.status = 'sending';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        const { feed, posts } = parseRss(response.data.contents);
        feed.url = url;
        const postsWithID = addPostsID(posts);
        state.posts.push(...postsWithID);
        state.feeds.push(feed);
        state.form.status = 'finished';
      })
      .catch((e) => {
        let errorMessage;
        if (e.name === 'AxiosError') {
          errorMessage = 'networkError';
        } else if (e.message === 'parseError') {
          errorMessage = 'invalidRss';
        } else {
          errorMessage = e.type;
        }
        state.form.error = errorMessage;
      });
  }));
};

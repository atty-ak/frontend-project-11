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
    modal: document.getElementById('modal'),
  };

  const initialState = {
    form: {
      status: 'filling',
      error: null,
    },
    posts: [],
    seenPosts: [],
    feeds: [],
    uiStateModal: {},
  };

  const state = onChange(initialState, render(elements, initialState, i18nInstance));

  const postsEventListener = (e) => {
    const targetPost = e.target;
    if (targetPost.tagName !== 'A') {
      return;
    }
    const targetPostId = targetPost.dataset.id;
    if (!state.seenPosts.includes(targetPostId)) {
      state.seenPosts.push(targetPostId);
    }
  };

  const modalEventListener = (e) => {
    const button = e.relatedTarget;
    const buttonId = button.dataset.id;
    const currentPost = state.posts.find((post) => post.id === buttonId);
    const { id } = currentPost;
    if (!state.seenPosts.includes(id)) {
      state.seenPosts.push(id);
    }
    state.uiStateModal = { ...currentPost };
  };

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

  const getUpdatedRss = () => {
    const rssList = state.feeds.map((feed) => feed.url);
    return rssList.map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => parseRss(response.data.contents)));
  };

  const updatePosts = (posts) => {
    const titles = state.posts.map((post) => post.title);
    const postsToUpdate = posts.filter((post) => !titles.includes(post.title));
    const postsWithID = addPostsID(postsToUpdate);
    state.posts.push(...postsWithID);
  };

  const checkForUpdates = () => {
    const promises = getUpdatedRss();
    Promise.allSettled(promises)
      .then((results) => {
        const fullfiledPosts = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value.posts);
        updatePosts(fullfiledPosts.flat());
      })
      .finally(() => {
        setTimeout(checkForUpdates, 5000);
      });
  };

  window.addEventListener('click', postsEventListener);
  elements.modal.addEventListener('show.bs.modal', modalEventListener);

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

  checkForUpdates();
};

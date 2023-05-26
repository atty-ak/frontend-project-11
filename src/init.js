import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watchState from './view.js';
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
    modal: {
      modalElement: document.querySelector('.modal'),
      title: document.querySelector('.modal-title'),
      description: document.querySelector('.modal-body'),
      readFullArticle: document.querySelector('.full-article'),
    },
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

  const watchedState = watchState(elements, initialState, i18nInstance);

  const postsEventListener = (e) => {
    const targetPost = e.target;
    if (targetPost.tagName !== 'A') {
      return;
    }
    const targetPostId = targetPost.dataset.id;
    if (!watchedState.seenPosts.includes(targetPostId)) {
      watchedState.seenPosts.push(targetPostId);
    }
  };

  const modalEventListener = (e) => {
    const button = e.relatedTarget;
    const buttonId = button.dataset.id;
    const currentPost = watchedState.posts.find((post) => post.id === buttonId);
    const { id } = currentPost;
    if (!watchedState.seenPosts.includes(id)) {
      watchedState.seenPosts.push(id);
    }
    watchedState.uiStateModal = { ...currentPost };
  };

  const validate = (url, feedList) => {
    const rssList = feedList.map((feed) => feed.url);
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

  const makeProxyUrl = (url) => {
    const apiUrl = 'https://allorigins.hexlet.app/get';
    const fullUrl = new URL(apiUrl);
    fullUrl.searchParams.set('disableCache', 'true');
    fullUrl.searchParams.set('url', url);
    return axios.get(fullUrl);
  };

  const getUpdatedRss = () => {
    const rssList = watchedState.feeds.map((feed) => feed.url);
    return rssList.map((url) => (makeProxyUrl(url))
      .then((response) => parseRss(response.data.contents)));
  };

  const updatePosts = (posts) => {
    const titles = watchedState.posts.map((post) => post.title);
    const postsToUpdate = posts.filter((post) => !titles.includes(post.title));
    const postsWithID = addPostsID(postsToUpdate);
    watchedState.posts.push(...postsWithID);
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

  elements.posts.addEventListener('click', postsEventListener);
  elements.modal.modalElement.addEventListener('show.bs.modal', modalEventListener);

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const url = data.get('url');
    validate(url, watchedState.feeds)
      .then(() => {
        watchedState.form.status = 'sending';
        return makeProxyUrl(url);
      })
      .then((response) => {
        const { feed, posts } = parseRss(response.data.contents);
        feed.url = url;
        const postsWithID = addPostsID(posts);
        watchedState.posts.push(...postsWithID);
        watchedState.feeds.push(feed);
        watchedState.form.status = 'finished';
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
        watchedState.form.error = errorMessage;
      });
  }));

  checkForUpdates();
};

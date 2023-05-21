const renderFinishedForm = (input, statusMessage, i18nInstance) => {
  input.classList.remove('is-invalid');
  input.value = '';
  input.focus();
  statusMessage.classList.remove('text-danger');
  statusMessage.classList.add('text-success');
  statusMessage.textContent = i18nInstance.t('formMessage.success');
};

const renderSendingForm = (input, statusMessage) => {
  input.classList.remove('is-invalid');
  statusMessage.textContent = '';
};

const renderErrorForm = (input, statusMessage, i18nInstance, error) => {
  input.classList.add('is-invalid');
  statusMessage.classList.add('text-danger');
  statusMessage.textContent = i18nInstance.t(`formMessage.${error}`);
  console.log(error);
};

const renderContainer = (type, i18nInstance) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  container.append(cardBody);
  cardBody.classList.add('card-body');
  const header = document.createElement('h2');
  cardBody.append(header);
  header.classList.add('card-title', 'h4');
  header.textContent = type === 'feeds' ? i18nInstance.t('feeds.title') : i18nInstance.t('posts.title');
  const list = document.createElement('ul');
  container.append(list);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return container;
};

const renderFeeds = (feedsEl, i18nInstance, feedList) => {
  feedsEl.innerHTML = '';
  if (feedList.length === 0) {
    return;
  }
  const view = renderContainer('feeds', i18nInstance);
  const list = view.querySelector('ul');
  feedList.forEach((el) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedHeader = document.createElement('h3');
    feed.append(feedHeader);
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = el.title;
    const description = document.createElement('p');
    feed.append(description);
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = el.description;
    list.append(feed);
  });
  feedsEl.append(view);
};

const renderPosts = (postsEl, modalEl, i18nInstance, postList) => {
  postsEl.innerHTML = '';
  if (postList.length === 0) {
    return;
  }
  const view = renderContainer('posts', i18nInstance);
  const list = view.querySelector('ul');
  postList.forEach((el) => {
    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    post.append(a);
    a.href = el.link;
    a.classList.add('fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', el.id);
    a.setAttribute('rel', 'noopener');
    a.setAttribute('rel', 'noreffer');
    a.textContent = el.title;
    const button = document.createElement('button');
    post.append(button);
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', el.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nInstance.t('posts.button');
    list.append(post);
  });
  postsEl.append(view);
};

const renderSeenPosts = (IDs) => {
  IDs.forEach((id) => {
    const seenPost = document.querySelector(`a[data-id="${id}"]`);
    seenPost.classList.remove('fw-bold');
    seenPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModalWindow = (modalEl, modalState) => {
  const title = modalEl.querySelector('.modal-title');
  const body = modalEl.querySelector('.modal-body');
  const readFullArticle = modalEl.querySelector('.full-article');
  title.textContent = modalState.title;
  body.textContent = modalState.description;
  readFullArticle.href = modalState.link;
};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.status':
      switch (value) {
        case 'finished':
          renderFinishedForm(elements.input, elements.statusMessage, i18nInstance);
          break;
        case 'sending':
          renderSendingForm(elements.input, elements.statusMessage);
          break;
        default:
          throw new Error('Unexpected form status');
      }
      break;
    case 'form.error':
      renderErrorForm(elements.input, elements.statusMessage, i18nInstance, state.form.error);
      break;
    case 'posts':
      renderPosts(elements.posts, elements.modal, i18nInstance, value);
      renderSeenPosts(state.seenPosts);
      break;
    case 'feeds':
      renderFeeds(elements.feeds, i18nInstance, value);
      break;
    case 'seenPosts':
      renderSeenPosts(value);
      break;
    case 'uiStateModal':
      renderModalWindow(elements.modal, value);
      break;
    default:
      break;
  }
};

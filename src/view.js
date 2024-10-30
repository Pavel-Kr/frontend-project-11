const renderState = (state) => {
  const rssForm = document.querySelector('form.rss-form');
  const urlInput = rssForm.querySelector('input[aria-label="url"]');
  const feedbackElement = document.querySelector('.feedback');
  switch (state) {
    case 'invalid':
      urlInput.classList.add('is-invalid');
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      break;
    case 'valid':
      urlInput.classList.remove('is-invalid');
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      break;
    default:
      throw new Error(`Invalid state: ${state}`);
  }
};

const createCard = (headerNode, contentNode) => {
  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  cardBody.append(headerNode);
  cardContainer.append(cardBody, contentNode);
  return cardContainer;
};

const renderFeeds = (feeds, i18nextInstance) => {
  const feedContainer = document.querySelector('#feeds');
  feedContainer.innerHTML = '';
  if (feeds.length === 0) {
    return;
  }
  const feedsHeader = document.createElement('h2');
  feedsHeader.classList.add('card-title');
  feedsHeader.textContent = i18nextInstance.t('feeds');

  const listContainer = document.createElement('ul');
  listContainer.classList.add('list-group', 'border-0');
  feeds.forEach((feed) => {
    const listElement = document.createElement('li');
    listElement.classList.add('list-group-item', 'border-0');
    const header = document.createElement('h5');
    header.textContent = feed.title;

    const description = document.createElement('p');
    description.textContent = feed.description;

    listElement.append(header, description);
    listContainer.append(listElement);
  });

  const cardContainer = createCard(feedsHeader, listContainer);
  feedContainer.append(cardContainer);
};

const setModal = (header, body, link) => {
  const postModal = document.querySelector('#postModal');
  const modalTitle = postModal.querySelector('.modal-title');
  const modalBody = postModal.querySelector('.modal-body');
  const modalLink = postModal.querySelector('a.post-link');
  modalTitle.textContent = header;
  modalBody.textContent = body;
  modalLink.setAttribute('href', link);
};

const isPostViewed = (postId, state) => state.uiState.viewedPosts.includes(postId);

const setPostViewed = (postId, state) => {
  state.uiState.viewedPosts.push(postId);
};

const createPostElement = (post, state, i18nextInstance) => {
  const listElement = document.createElement('li');
  listElement.classList.add('list-group-item', 'border-0', 'd-flex', 'justify-content-between');

  const postLink = document.createElement('a');
  postLink.textContent = post.title;
  postLink.setAttribute('href', post.link);
  if (isPostViewed(post.id, state)) {
    postLink.classList.add('link-secondary', 'fw-normal');
    postLink.classList.remove('fw-bold');
  } else {
    postLink.classList.remove('fw-normal');
    postLink.classList.add('fw-bold');
  }

  const watchButton = document.createElement('button');
  watchButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  watchButton.textContent = i18nextInstance.t('view');
  watchButton.setAttribute('data-bs-toggle', 'modal');
  watchButton.setAttribute('data-bs-target', '#postModal');

  listElement.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-bs-toggle]');
    const link = e.target.closest('a');
    if (btn) {
      setModal(post.title, post.description, post.link);
      setPostViewed(post.id, state);
    } else if (link) {
      setPostViewed(post.id, state);
    }
  });

  listElement.append(postLink, watchButton);

  return listElement;
};

const renderPosts = (state, i18nextInstance) => {
  const { posts } = state;
  const postsContainer = document.querySelector('#posts');
  postsContainer.innerHTML = '';
  if (posts.length === 0) {
    return;
  }
  const postsHeader = document.createElement('h2');
  postsHeader.classList.add('card-title');
  postsHeader.textContent = i18nextInstance.t('posts');

  const listContainer = document.createElement('ul');
  listContainer.classList.add('list-group', 'border-0');
  posts.forEach((post) => {
    const listElement = createPostElement(post, state, i18nextInstance);
    listContainer.append(listElement);
  });

  const cardContainer = createCard(postsHeader, listContainer);
  postsContainer.append(cardContainer);
};

const render = (path, value, state, i18nextInstance) => {
  const feedbackElement = document.querySelector('.feedback');
  const rssForm = document.querySelector('form.rss-form');
  const urlInput = rssForm.querySelector('input[aria-label="url"]');
  switch (path) {
    case 'rssForm.state':
      renderState(value);
      break;
    case 'rssForm.feedbackType':
      feedbackElement.textContent = i18nextInstance.t(value);
      break;
    case 'feeds':
      renderFeeds(value, i18nextInstance);
      break;
    case 'posts':
    case 'uiState.viewedPosts':
      renderPosts(state, i18nextInstance);
      break;
    case 'addedUrls':
      rssForm.reset();
      urlInput.focus();
      break;
    default:
      // Not an error, just ignore
      break;
  }
};

export default render;

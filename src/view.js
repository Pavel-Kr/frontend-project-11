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
      rssForm.reset();
      urlInput.focus();
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

const renderPosts = (posts, i18nextInstance) => {
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
    const listElement = document.createElement('li');
    listElement.classList.add('list-group-item', 'border-0', 'd-flex', 'justify-content-between');

    const postLink = document.createElement('a');
    postLink.textContent = post.title;
    postLink.setAttribute('href', post.link);

    const watchButton = document.createElement('button');
    watchButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    watchButton.textContent = i18nextInstance.t('watch');

    listElement.append(postLink, watchButton);
    listContainer.append(listElement);
  });

  const cardContainer = createCard(postsHeader, listContainer);
  postsContainer.append(cardContainer);
};

const render = (path, value, i18nextInstance) => {
  console.log(path);
  const feedbackElement = document.querySelector('.feedback');
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
      renderPosts(value, i18nextInstance);
      break;
    default:
      // Not an error, just ignore
      break;
  }
};

export default render;

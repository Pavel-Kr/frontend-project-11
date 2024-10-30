import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';

import './scss/styles.scss';
import 'bootstrap';

import render from './view.js';
import resources from './locale/index.js';
import parseXML from './parseXML.js';
import IdGenerator from './idGenerator.js';

let feedIdGenerator;
let postIdGenerator;

const initI18Next = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });
  return i18nextInstance;
};

const initYup = () => {
  setLocale({
    mixed: {
      default: 'invalidKey',
      notOneOf: () => ({ key: 'duplicateUrl' }),
    },
    string: {
      url: () => ({ key: 'invalidUrl' }),
    },
  });
};

const init = () => {
  const state = {
    rssForm: {
      state: '',
      feedbackType: '',
    },
    addedUrls: [],
    feeds: [],
    posts: [],
    uiState: {
      viewedPosts: [],
    },
  };

  const i18nextInstance = initI18Next();
  initYup();

  feedIdGenerator = new IdGenerator();
  postIdGenerator = new IdGenerator();

  return { state, i18nextInstance };
};

const getRequestUrl = (url) => `https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}&disableCache=true`;

const mapPostToState = (post) => ({
  id: postIdGenerator.generateId(),
  ...post,
});

const updateFeeds = (state) => {
  const promises = state.feeds.map(({ source }) => axios.get(getRequestUrl(source)));
  Promise.all(promises)
    .then((responses) => {
      const results = responses.map((response) => parseXML(response.data.contents));
      results.forEach((result) => {
        if (!result.ok) {
          return;
        }
        const { posts } = result;
        const titles = state.posts.map((post) => post.title);
        const includedPosts = posts
          .filter((post) => !titles.includes(post.title))
          .map(mapPostToState);
        state.posts.unshift(...includedPosts);
      });
      setTimeout(() => updateFeeds(state), 5000);
    })
    .catch((err) => {
      console.log(err);
    });
};

const app = () => {
  const { state, i18nextInstance } = init();

  const validateUrl = (url) => {
    const schema = object({
      url: string()
        .url()
        .required()
        .notOneOf(state.addedUrls),
    });
    return schema.validate({ url });
  };

  const watchedState = onChange(
    state,
    (path, value) => render(path, value, watchedState, i18nextInstance),
  );

  const rssForm = document.querySelector('form.rss-form');

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(rssForm);
    const url = data.get('url');

    validateUrl(url)
      .then(() => axios.get(getRequestUrl(url)))
      .then((response) => {
        const result = parseXML(response.data.contents);
        if (result.ok) {
          watchedState.rssForm.state = 'valid';
          watchedState.rssForm.feedbackType = 'success';
          watchedState.addedUrls.push(url);

          const { ok, posts: rssPosts, ...rssFeed } = result;
          const feed = {
            id: feedIdGenerator.generateId(),
            source: url,
            ...rssFeed,
          };
          const posts = rssPosts.map(mapPostToState);
          watchedState.feeds.unshift(feed);
          watchedState.posts.unshift(...posts);
        } else {
          const { reason } = result;
          watchedState.rssForm.state = 'invalid';
          watchedState.rssForm.feedbackType = reason;
        }
      })
      .catch((err) => {
        watchedState.rssForm.state = 'invalid';
        switch (err.name) {
          case 'ValidationError':
            watchedState.rssForm.feedbackType = err.errors[0].key;
            break;
          case 'AxiosError':
            watchedState.rssForm.feedbackType = 'networkError';
            break;
          default:
            console.log(`Unknown error: ${err.name}`);
            console.log(err);
        }
      });

    updateFeeds(watchedState);
  });
};

app();

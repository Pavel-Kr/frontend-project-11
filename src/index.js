import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';

import './scss/styles.scss';
import 'bootstrap';

import render from './view.js';
import resources from './locale/index.js';
import parseXML from './parseXML.js';

const initI18Next = () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });
};

const initYup = () => {
  setLocale({
    mixed: {
      default: 'invalidKey',
      required: () => ({ key: 'empty' }),
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
      state: 'init',
      feedbackMessage: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      viewedPosts: [],
    },
  };

  let translationFunc;

  return initI18Next()
    .then((t) => {
      translationFunc = t;
      initYup();
    })
    .then(() => {
      const watchedState = onChange(
        state,
        (path, value) => render(path, value, watchedState, translationFunc),
      );
      return watchedState;
    });
};

const getRequestUrl = (urlString) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('url', urlString);
  url.searchParams.set('disableCache', 'true');
  return url.toString();
};

const mapPostToState = (post) => ({
  id: _.uniqueId('post'),
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

const validateUrl = (url, state) => {
  const sources = state.feeds.map(({ source }) => source);
  const schema = object({
    url: string()
      .url()
      .required()
      .notOneOf(sources),
  });
  return schema.validate({ url });
};

const processUrl = (url, paramState) => {
  const state = paramState; // How do you like it, linter? No param reassign, sure
  validateUrl(url, state)
    .then(() => axios.get(getRequestUrl(url)))
    .then((response) => {
      try {
        const result = parseXML(response.data.contents);
        state.rssForm.state = 'valid';
        state.rssForm.feedbackMessage = 'success';

        const { ok, posts: rssPosts, ...rssFeed } = result;
        const feed = {
          id: _.uniqueId('feed'),
          source: url,
          ...rssFeed,
        };
        const posts = rssPosts.map(mapPostToState);
        state.feeds.unshift(feed);
        state.posts.unshift(...posts);
      } catch (e) {
        state.rssForm.state = 'invalid';
        state.rssForm.feedbackMessage = e.message;
      }
    })
    .catch((err) => {
      state.rssForm.state = 'invalid';
      switch (err.name) {
        case 'ValidationError':
          state.rssForm.feedbackMessage = err.errors[0].key;
          break;
        case 'AxiosError':
          state.rssForm.feedbackMessage = 'networkError';
          break;
        default:
          console.log(`Unknown error: ${err.name}`);
          console.log(err);
      }
    });
};

const app = () => {
  init().then((paramState) => {
    const state = paramState; // What's up, linter?
    const rssForm = document.querySelector('form.rss-form');

    rssForm.addEventListener('submit', (e) => {
      state.rssForm.state = 'processing';
      e.preventDefault();

      const data = new FormData(rssForm);
      const url = data.get('url');
      processUrl(url, state);
    });
    updateFeeds(state);
  });
};

app();

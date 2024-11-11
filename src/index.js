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
      state: 'initial',
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      viewedPosts: [],
    },
  };

  return initI18Next()
    .then((t) => {
      initYup();
      const watchedState = onChange(
        state,
        (path, value) => render(path, value, watchedState, t),
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
      try {
        const results = responses.map((response) => parseXML(response.data.contents));
        results.forEach((result) => {
          const { posts } = result;
          const titles = state.posts.map((post) => post.title);
          const includedPosts = posts
            .filter((post) => !titles.includes(post.title))
            .map(mapPostToState);
          state.posts.unshift(...includedPosts);
        });
      } catch (e) {
        console.log(e);
      }
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setTimeout(() => updateFeeds(state), 5000);
    });
};

const validateUrl = (url, sources) => {
  const schema = object({
    url: string()
      .url()
      .required()
      .notOneOf(sources),
  });
  return schema.validate({ url });
};

const processUrl = (url, paramState) => {
  const state = paramState;
  const sources = state.feeds.map(({ source }) => source);
  validateUrl(url, sources)
    .then(() => {
      state.rssForm.state = 'processing';
      return axios.get(getRequestUrl(url));
    })
    .then((response) => {
      try {
        const result = parseXML(response.data.contents);
        state.rssForm.state = 'valid';

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
        state.rssForm.error = 'parserError';
        state.rssForm.state = 'invalid';
      }
    })
    .catch((err) => {
      switch (err.name) {
        case 'ValidationError':
          state.rssForm.error = err.errors[0].key;
          break;
        case 'AxiosError':
          state.rssForm.error = 'networkError';
          break;
        default:
          console.log(`Unknown error: ${err.name}`);
          console.log(err);
      }
      state.rssForm.state = 'invalid';
    });
};

const app = () => {
  init().then((paramState) => {
    const { rssForm: rssFormState } = paramState;
    const rssForm = document.querySelector('form.rss-form');

    rssForm.addEventListener('submit', (e) => {
      rssFormState.state = 'initial';
      e.preventDefault();

      const data = new FormData(rssForm);
      const url = data.get('url');
      processUrl(url, paramState);
    });
    updateFeeds(paramState);
  });
};

app();

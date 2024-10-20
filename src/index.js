import { object, string, setLocale } from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';

import './scss/styles.scss';
import render from './view.js';
import resources from './locale/index.js';

const app = () => {
  const state = {
    rssForm: {
      state: '',
      feedbackType: '',
    },
    addedUrls: [],
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  setLocale({
    mixed: {
      default: 'invalidKey',
      notOneOf: () => ({ key: 'duplicateUrl' }),
    },
    string: {
      url: () => ({ key: 'invalidUrl' }),
    },
  });

  const validateUrl = (url) => {
    const schema = object({
      url: string()
        .url()
        .required()
        .notOneOf(state.addedUrls),
    });
    return schema.validate({ url });
  };

  const rssForm = document.querySelector('form.rss-form');

  const watchedState = onChange(state, (path, value) => render(path, value, i18nextInstance));

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(rssForm);
    const url = data.get('url');

    validateUrl(url)
      .then(() => {
        watchedState.rssForm.state = 'valid';
        watchedState.rssForm.feedbackType = 'success';
        watchedState.addedUrls.push(url);
      })
      .catch((err) => {
        watchedState.rssForm.feedbackType = err.errors[0].key;
        watchedState.rssForm.state = 'invalid';
      });
  });
};

app();

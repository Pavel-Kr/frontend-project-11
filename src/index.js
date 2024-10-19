import { object, string } from 'yup';
import onChange from 'on-change';

import './scss/styles.scss';
import render from './view.js';

const app = () => {
  const state = {
    rssForm: {
      state: '',
      feedback: '',
    },
    addedUrls: [],
  };

  const validateUrl = (url) => {
    const schema = object({
      url: string()
        .url('Link must be a valid URL')
        .required()
        .notOneOf(state.addedUrls, 'RSS already exists'),
    });
    return schema.validate({ url });
  };

  const rssForm = document.querySelector('form.rss-form');

  const watchedState = onChange(state, render);

  // https://aljazeera.com/xml/rss/all.xml

  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(rssForm);
    const url = data.get('url');

    validateUrl(url)
      .then(() => {
        watchedState.rssForm.state = 'valid';
        watchedState.rssForm.feedback = 'RSS was successfully loaded';
        watchedState.addedUrls.push(url);
      })
      .catch((err) => {
        [watchedState.rssForm.feedback] = err.errors;
        watchedState.rssForm.state = 'invalid';
      });
  });
};

app();

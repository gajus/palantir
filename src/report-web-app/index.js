// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';

const main = async () => {
  const app = document.getElementById('app');

  if (!app) {
    throw new Error('app element is not present');
  }

  ReactDOM.render(<Root />, app);
};

main();

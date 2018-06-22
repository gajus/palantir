// @flow

/* eslint-disable global-require, import/no-dynamic-require */

import path from 'path';

export default (modulePath: string): * => {
  // $FlowFixMe
  const module = require(path.resolve(process.cwd(), modulePath));

  return module.default || module;
};

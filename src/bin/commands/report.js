// @flow

import {
  parse as parseUrl
} from 'url';
import path from 'path';
import express from 'express';
import serveStatic from 'serve-static';
import proxy from 'express-http-proxy';
import {
  createResponseBody,
  createWebpackConfiguration
} from '../../factories';

type ArgvType = {|
  +basePath: string,
  +palantirApiUrl: string,
  +servicePort: number
|};

export const command = 'report';
export const description = 'Creates a web UI for the Palantir HTTP API.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      'base-path': {
        default: '/',
        type: 'string'
      },
      'palantir-api-url': {
        demand: true,
        type: 'string'
      },
      'service-port': {
        default: 8080,
        type: 'number'
      }
    });
};

export const handler = async (argv: ArgvType) => {
  const app = express();

  app.set('etag', 'strong');
  app.set('trust proxy', true);
  app.set('x-powered-by', false);

  const webpackConfiguration = createWebpackConfiguration(argv.basePath);

  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable global-require */
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    /* eslint-enable global-require */

    const bundler = webpack(webpackConfiguration);

    const devServerOptions = {
      colors: true,
      hot: true,
      noInfo: false,
      outputPath: path.resolve(__dirname, '../../../.static'),
      publicPath: argv.basePath + 'static/',
      quiet: false,
      stats: 'minimal'
    };

    app.use(webpackDevMiddleware(bundler, devServerOptions));
  } else {
    app.use('/static', serveStatic(path.resolve(__dirname, '../../../.static'), {
      fallthrough: true,
      index: false
    }));
  }

  app.use('/api', proxy(argv.palantirApiUrl, {
    proxyReqPathResolver: () => {
      return parseUrl(argv.palantirApiUrl).path;
    }
  }));

  app.use('/', (req, res) => {
    const scriptUrls = [];
    const styleUrls = [];

    scriptUrls.push(argv.basePath + 'static/main.bundle.js');

    styleUrls.push('https://fonts.googleapis.com/css?family=Source+Code+Pro|Roboto');

    const response = createResponseBody(
      {
        API_URL: '/api',
        BASE_PATH: argv.basePath
      },
      scriptUrls,
      styleUrls,
      ''
    );

    res
      .send(response);
  });

  app.listen(argv.servicePort);
};

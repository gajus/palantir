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
  +apiUrl: string,
  +basePath: string,
  +servicePort: number
|};

export const command = 'report';
export const description = 'Creates a web UI for the Palantir HTTP API.';

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .env('PALANTIR_REPORT')
    .options({
      'api-url': {
        demand: true,
        type: 'string'
      },
      'base-path': {
        default: '/',
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

  const router = express.Router();

  app.set('etag', 'strong');
  app.set('trust proxy', true);
  app.set('x-powered-by', false);

  const webpackConfiguration = createWebpackConfiguration(argv.basePath);

  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable global-require */
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    /* eslint-enable global-require */

    const compiler = webpack(webpackConfiguration);

    const devServerOptions = {
      publicPath: argv.basePath + 'static/',
      stats: 'minimal'
    };

    router.use(webpackDevMiddleware(compiler, devServerOptions));
    router.use(webpackHotMiddleware(compiler));
  } else {
    router.use('/static', serveStatic(path.resolve(__dirname, '../../../.static'), {
      fallthrough: true,
      index: false
    }));
  }

  router.use('/api', proxy(argv.apiUrl, {
    proxyReqPathResolver: () => {
      return parseUrl(argv.apiUrl).path;
    }
  }));

  router.use('/', (req, res) => {
    const scriptUrls = [];
    const styleUrls = [];

    scriptUrls.push(argv.basePath + 'static/main.bundle.js');

    styleUrls.push('https://fonts.googleapis.com/css?family=Source+Code+Pro|Roboto');

    const response = createResponseBody(
      {
        API_URL: argv.apiUrl,
        BASE_PATH: argv.basePath
      },
      scriptUrls,
      styleUrls,
      ''
    );

    res
      .send(response);
  });

  app.use(argv.basePath, router);

  app.listen(argv.servicePort);
};

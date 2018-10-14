// @flow

import path from 'path';
import webpack from 'webpack';

export default (basePath: string) => {
  let configuration = {
    devtool: 'source-map',
    entry: {
      main: [
        path.resolve(__dirname, '../report-web-app')
      ]
    },
    mode: 'production',
    module: {
      rules: [
        {
          include: path.resolve(__dirname, '../report-web-app'),
          loader: 'babel-loader',
          test: /\.js$/
        },
        {
          loaders: [
            'style-loader?sourceMap',
            {
              loader: 'css-loader',
              options: {
                camelCase: true,
                importLoaders: 1,
                localIdentName: '[path]___[local]___[hash:base64:5]',
                modules: true
              }
            },
            'resolve-url-loader',
            {
              loader: 'postcss-loader'
            },
            'sass-loader'
          ],
          test: /\.scss/
        }
      ]
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, '../../.static'),
      publicPath: basePath + 'static/'
    }
  };

  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV === 'development') {
    configuration = {
      ...configuration,
      devtool: 'inline-source-map',
      entry: {
        ...configuration.entry,
        main: [
          'webpack-hot-middleware/client',
          ...configuration.entry.main
        ]
      },
      mode: 'development',
      plugins: [
        new webpack.HotModuleReplacementPlugin()
      ]
    };
  }

  return configuration;
};

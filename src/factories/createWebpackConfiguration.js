// @flow

import path from 'path';

export default (basePath: string) => {
  return {
    devtool: 'inline-source-map',
    entry: {
      main: path.resolve(__dirname, '../report-web-app')
    },
    mode: 'development',
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
};

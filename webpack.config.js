/* global require, __dirname, module */

const { join } = require('path');

const config = {
  entry: ['./src/index.js', './src/index.css'],
  output: {
    path: join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.svg|\.jpg|\.png$/,
        type: 'asset',
      },
    ],
  },
};

module.exports = config;

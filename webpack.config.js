/* global require, __dirname, module */

const { join } = require('path');

/*
const { existsSync, mkdirSync } = require('fs');
require('dotenv').config();

const path = join(__dirname, process.env.DISTDIR);
if (!existsSync(path)) mkdirSync(path);
*/

const config = {
  entry: ['./src/index.js', './src/index.scss'],
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          'sass-loader',
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

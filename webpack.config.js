/* global require, __dirname, module */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join } = require('path');

const config = {
  entry: './src/index.js', // Only one entry point: your JS file

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
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.svg|\.jpg|\.png$/,
        type: 'asset',
        generator: {
          // Add this to configure output filename for assets
          filename: 'assets/[name][ext][query]', // Or any pattern you want
        },
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'index.css', // Creates index.css and styles.css
    }),
  ],
};

module.exports = config;

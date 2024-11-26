/* global require, __dirname, module */
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');

const { join } = require('path');

const config = {
  entry: {
    recycling: ['./src/recycling.css'],
  },
  output: {
    path: join(__dirname, 'dist'),
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-preset-env')({
                    stage: 0,
                    features: { 'nesting-rules': true },
                  }),
                  autoprefixer,
                ],
              },
            },
          },
        ],
      },
    ],
  },
  /*
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
  */
};

module.exports = config;

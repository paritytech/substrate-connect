/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const common = require('./webpack.config.js');

 // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
 module.exports = merge(common, 
  {
    mode: 'production',
    plugins: [
      new HtmlWebpackPlugin({
          template: "public/index.html",
          hash: true,
          filename: 'index.html'
      }),
      new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
      }),
      new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js'
      })
    ]
  },
);
 
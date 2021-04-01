/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const common = require('./webpack.config.js');
 module.exports = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
   devServer: {
       contentBase: path.join(__dirname, 'dist'),
       port: 1234,
       hot: true
   },
   plugins: [
    new HtmlWebpackPlugin({
        template: "public/index.html",
        hash: true,
        filename: 'index.html'
    }),
    new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development')
        }
    }),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js'
    })
  ],
 });
 
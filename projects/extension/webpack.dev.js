/* eslint-disable @typescript-eslint/no-unsafe-call */
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
 module.exports = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
   devServer: {
     contentBase: './dist',
     hot: true,
   },
 });
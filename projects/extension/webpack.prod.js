/* eslint-disable @typescript-eslint/no-unsafe-call */
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
 module.exports = merge(common, {
   mode: 'production',
 });
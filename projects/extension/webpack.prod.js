/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
 // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
 module.exports = merge(common, {mode: 'production'});
 
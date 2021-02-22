import { merge } from 'webpack-merge';
import common from './webpack.config.js';
 // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
 module.exports = merge(common, {mode: 'production'});
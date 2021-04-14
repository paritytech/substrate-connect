/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { merge } from 'webpack-merge';
import config from './webpack.config.js';
export default merge(config, {
   mode: 'development',
   devtool: 'inline-source-map',
   devServer: {
     contentBase: './dist',
     hot: true,
   },
   watch: true,
   watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 1000,
    poll: 1000
  },
 });
 
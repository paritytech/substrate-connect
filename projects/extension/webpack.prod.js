/* eslint-disable @typescript-eslint/no-var-requires */
import { merge } from 'webpack-merge';
import config from './webpack.config.js';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export default merge(config, {mode: 'production'});
 
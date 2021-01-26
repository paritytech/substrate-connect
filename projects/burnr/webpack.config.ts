// import both these to make typescript pickup the types properly
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}
import path from 'path';
import { ProvidePlugin } from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import cssnano from 'cssnano';

import { SERVER_PORT, IS_DEV, WEBPACK_PORT } from './src/server/config';

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const targets = IS_DEV ? { chrome: '79', firefox: '72' } : '> 0.25%, not dead';

const config: Configuration = {
  mode: IS_DEV ? 'development' : 'production',
  devtool: IS_DEV ? 'inline-source-map' : false,
  entry: ['./src/index'],
  output: {
    path: path.join(__dirname, 'dist', 'statics'),
    filename: `[name]-[hash:8]-bundle.js`,
    chunkFilename: '[name]-[hash:8]-bundle.js',
    publicPath: '/statics/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer-browserify')
    }
  },
  optimization: {
    minimize: !IS_DEV,
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        material: {
          test: /[\\/]node_modules[\\/]@material-ui[\\/]/,
          name: 'material-ui',
          chunks: 'all',
          priority: 20,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: [/node_modules/, nodeModulesPath],
        use: {
          loader: require.resolve('babel-loader'),
          options: require('@polkadot/dev/config/babel'),
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve('style-loader'),
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: true,
              localsConvention: 'camelCase',
              sourceMap: IS_DEV,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              sourceMap: IS_DEV,
              plugins: IS_DEV ? [cssnano()] : [],
            },
          }
        ],
      },
      {
        test: /\.js$/,
        // https://github.com/webpack/webpack/issues/6719#issuecomment-546840116
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      },
      {
        test: /.jpe?g$|.gif$|.png$|.svg$|.woff$|.woff2$|.ttf$|.eot$/,
        use: require.resolve('url-loader')
        options: {
          limit: 10000
        }
      },
    ],
  },
  node: {
  },
  performance: {
    hints: false,
  },
  devServer: {
    port: WEBPACK_PORT,
    overlay: IS_DEV,
    open: IS_DEV,
    openPage: `http://localhost:${SERVER_PORT}`,
  },
  plugins: [
    new WebpackManifestPlugin(),
    new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
    })
  ]
};

export default config;

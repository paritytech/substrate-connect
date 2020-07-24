module.exports = config;

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackPluginServe } = require('webpack-plugin-serve');

const isProd = process.env.NODE_ENV  === 'production';
const hasPublic = fs.existsSync(path.join(__dirname, 'public'));
const plugins = hasPublic
  ? [new CopyWebpackPlugin({ patterns: [{ from: 'public' }] })]
  : [];

!isProd && plugins.push(
  new WebpackPluginServe({
    hmr: false, // switch off, Chrome WASM memory leak
    liveReload: false, // explict off, overrides hmr
    port: 8088,
    progress: false, // since we have hmr off, disable
    static: path.join(__dirname, '/build')
  })
);

module.exports = {
  context: __dirname,
  entry: {
    admin: './src/indexAdmin.tsx',
    user: './src/indexUser.tsx'
  },
  devtool: false,
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        exclude: /(node_modules)/,
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1
            }
          }
        ]
      },
      {
        include: /node_modules/,
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader')
        ]
      },
      {
        exclude: /(node_modules)/,
        test: /\.(js|ts|tsx)$/,
        use: [
          require.resolve('thread-loader'),
          {
            loader: require.resolve('babel-loader'),
            options: require('./.babelrc.js.js.js')
          }
        ]
      },
      {
        test: /\.md$/,
        use: [
          require.resolve('html-loader'),
          require.resolve('markdown-loader')
        ]
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              esModule: false,
              limit: 10000,
              name: 'src/assets/[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: [/\.eot$/, /\.ttf$/, /\.(jpg|png|svg)$/, /\.woff$/, /\.woff2$/],
        use: [
          {
            loader: require.resolve('file-loader'),
            options: {
              esModule: false,
              name: 'src/assets/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  },
  node: {
    child_process: 'empty',
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  output: {
    chunkFilename: '[name].[chunkhash:8].js',
    filename: '[name].[hash:8].js',
    globalObject: '(typeof self !== \'undefined\' ? self : this)',
    path: path.join(__dirname, 'build'),
    publicPath: ''
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {}
    }
  },
  performance: {
    hints: false
  },
  plugins: plugins.concat([
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.SplitChunksPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['user'],
      filename: 'index.html',
      inject: true,
      template: path.join(__dirname, 'public/index.html')
    }),
    new HtmlWebpackPlugin({
      chunks: ['admin'],
      filename: 'admin.html',
      inject: true,
      template: path.join(__dirname, 'public/index.html')
    })
  ]),
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  watch: !isProd,
  watchOptions: {
    ignored: ['.yarn', /build/, /node_modules/]
  }
};

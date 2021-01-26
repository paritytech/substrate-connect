const HtmlWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require('path');

module.exports = {
  devtool: 'eval-cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    port: 4000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: require.resolve('babel-loader')
      },
      {
        test: /\.(css)$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              name: '[path][name].[ext]?hash=[hash:20]',
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.js$/,
        // https://github.com/webpack/webpack/issues/6719#issuecomment-546840116
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: './favicon.ico',
      files: {
        css: ['./src/style.css']
      }
    })
  ],
  performance: {
    hints: false
  },
  node: {
    fs: 'empty'
  }
};

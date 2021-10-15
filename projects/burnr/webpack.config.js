/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  devtool: "inline-source-map",
  devServer: {
    port: 3000,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    alias: {
      "react/jsx-runtime": require.resolve("react/jsx-runtime"),
    },
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process": JSON.stringify(undefined),
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

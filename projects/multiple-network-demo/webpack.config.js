/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createRequire } from 'module';
import { DefinePlugin, ProvidePlugin, HotModuleReplacementPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

export const mode = "development";
export const entry = "./src/index.ts";
export const devtool = "inline-source-map";
export const devServer = {
  port: 3000,
  open: true,
  hot: true,
};
export const module = {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    },
    { test: /\.tsx?$/, loader: "ts-loader" },
    {
      test: /\.css$/i,
      use: ["style-loader", "css-loader"],
    },
  ],
};

const require = createRequire(import.meta.url);

export const resolve = {
  alias: {
    "react/jsx-runtime": require.resolve("react/jsx-runtime"),
  },
  extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  fallback: {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
  },
};
export const plugins = [
  new DefinePlugin({
    "process.env.WS_URL": JSON.stringify(undefined),
  }),
  new HtmlWebpackPlugin({
    template: "./index.html",
  }),
  new ProvidePlugin({
    Buffer: ["buffer", "Buffer"],
  }),
  new HotModuleReplacementPlugin(),
];

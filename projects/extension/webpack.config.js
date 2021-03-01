const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const CopyPlugin  = require("copy-webpack-plugin");

const config = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    popup: path.join(__dirname, "src/popup.tsx"),
    options: path.join(__dirname, "src/options.tsx"),
    content: path.join(__dirname, "src/content.ts"),
    page: path.join(__dirname, "src/page.ts"),
    background: path.join(__dirname, "src/background/index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.svg$/,
        use: "file-loader",
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: "file-loader"
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "url-loader",
            options: {
              mimetype: "image/png",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      `...`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      new HtmlMinimizerPlugin(),
    ],
  },
};

module.exports = config;

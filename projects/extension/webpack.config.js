import path from "path"
import HtmlMinimizerPlugin from "html-minimizer-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import webpack from "webpack"

const config = {
  entry: {
    popup: path.resolve("src/popup.tsx"),
    options: path.resolve("src/options.tsx"),
    content: path.resolve("src/content/index.ts"),
    background: path.resolve("src/background/index.ts"),
  },
  output: {
    path: path.resolve("dist"),
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      mangleWasmImports: true,
      chunks: "all",
    },
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
          projectReferences: true,
          transpileOnly: true,
        },
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
        use: "file-loader",
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
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.EnvironmentPlugin({
      PKG_NAME: "@substrate/extension",
      PKG_VERSION: "0.1.0",
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [`...`, new HtmlMinimizerPlugin()],
  },
}

export default config

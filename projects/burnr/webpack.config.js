const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'inline-source-map',
    entry: {
        app: path.join(__dirname, 'src/index.tsx')
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 1234,
        hot: true,
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    node: {
        global: true,
        __filename: 'mock',
        __dirname: 'mock'
    },
    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                use: [
                  {
                    loader: 'svg-url-loader',
                    options: {
                      limit: 10000,
                    },
                  },
                ],
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false
                }
            }
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".tsx", ".ts"],
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify")
        },
        alias: {
            "react-dom": "@hot-loader/react-dom",
            "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
            "react/jsx-runtime": "react/jsx-runtime.js"
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "public/index.html",
            hash: true,
            filename: 'index.html'
        }),
        new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser.js'
        })
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

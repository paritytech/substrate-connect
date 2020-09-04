## needs to be added to webpack config in order to load Wasm File from module
  {
    test: /\.js$/,
    // https://github.com/webpack/webpack/issues/6719#issuecomment-546840116
    loader: require.resolve('@open-wc/webpack-import-meta-loader'),
  }

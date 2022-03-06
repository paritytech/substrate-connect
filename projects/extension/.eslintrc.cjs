module.exports = {
  parserOptions: {
    // See the connect .eslintrc.cjs for an explanation of this config
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
    project: [
      "../../packages/connect-extension-protocol/tsconfig.json",
      "./tsconfig.json",
    ],
  },
}

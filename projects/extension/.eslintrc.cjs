module.exports = {
  parserOptions: {
    // See the connect .eslintrc.cjs for an explanation of this config
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
    project: [
      "../../packages/connect-extension-protocol/tsconfig.json",
      "./tsconfig.json"
    ]
  },
  rules: {
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  plugins: [
    "react-hooks"
  ],
  extends: [
    "plugin:react/recommended"
  ]
};

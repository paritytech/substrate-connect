module.exports = {
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

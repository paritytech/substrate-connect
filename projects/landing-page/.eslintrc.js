module.exports = {
  plugins: [
    "react-hooks"
  ],
  rules: {
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  extends: [
    "plugin:react/recommended"
  ]
};

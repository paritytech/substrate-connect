// eslint-disable-next-line no-undef
module.exports = {
  rules: {
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/react-in-jsx-scope": "off",
  },
  plugins: ["react-hooks"],
  extends: ["plugin:react/recommended"],
}

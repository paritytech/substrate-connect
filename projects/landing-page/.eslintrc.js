module.exports = {
  plugins: [
    "react-hooks"
  ],
  rules: {
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksConditionals": false
      }
    ],
    "@typescript-eslint/restrict-plus-operands": [
      "error",
      {
        "checkCompoundAssignments": false
      }
    ]
  },
  extends: [
    "plugin:react/recommended"
  ]
};

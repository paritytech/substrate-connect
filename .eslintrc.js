module.exports = {
  root: true,
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/restrict-plus-operands": [
      "error",
      { "checkCompoundAssignments": false }
    ],
    "@typescript-eslint/restrict-template-expressions": "off",
    "tsdoc/syntax": "error"
  },
  parser: "@typescript-eslint/parser",
  settings: { react: { version: "detect" } },
  plugins: [
    "@typescript-eslint",
    "eslint-plugin-tsdoc"
  ],
  parserOptions: {
    project: "./tsconfig.json",
    createDefaultProgram: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  env: {
    browser: true
  }
};

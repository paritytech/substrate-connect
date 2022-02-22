module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  settings: { react: { version: "detect" } },
  parserOptions: {
    project: "./tsconfig.json",
    createDefaultProgram: true,
  },
  extends: ["react-app", "react-app/jest", "prettier"],
  env: {
    browser: true,
  },
}

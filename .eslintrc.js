module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  settings: { react: { version: "detect" } },
  parserOptions: {
    project: "./tsconfig.json",
    createDefaultProgram: true,
  },
  extends: ["react-app", "react-app/jest", "prettier"],
  plugins: ["import"],
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.test.ts", "**/*.spec.ts"],
      },
    ],
  },
  env: {
    browser: true,
  },
  globals: {
    chrome: true,
  },
}

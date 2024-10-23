module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./packages/*/tsconfig.json", "./projects/*/tsconfig.json"],
  },
  settings: { react: { version: "detect" } },
  extends: ["react-app", "prettier"],
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.test.ts", "**/*.spec.ts", "**/*.bench.ts"],
      },
    ],
    "@typescript-eslint/no-redeclare": "off",
  },
  env: {
    browser: true,
  },
  globals: {
    chrome: true,
  },
}

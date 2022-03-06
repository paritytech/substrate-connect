const path = require("path")

module.exports = {
  rules: {
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.test.ts", "**/*.spec.ts", "**/*.config.js"],
        packageDir: [path.join(__dirname, "../../"), path.join(__dirname)],
      },
    ],
  },
}

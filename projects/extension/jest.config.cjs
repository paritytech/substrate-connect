module.exports = {
  coverageReporters: ["text-summary", "lcov"],
  roots: ["<rootDir>/src"],
  reporters: ["jest-silent-reporter"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest-setup.js"],
  verbose: true,
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  preset: "ts-jest/presets/js-with-babel-esm",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
}

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironmentOptions: {
    url: "http://localhost/",
  },
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
}

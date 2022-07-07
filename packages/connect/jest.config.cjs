module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts"],
  testURL: "http://localhost/",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.esm.json",
      useESM: true,
    },
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
}

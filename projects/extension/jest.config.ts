export default {
  coverageReporters: ["text-summary"],
  roots: ['<rootDir>/src'],
  reporters: ["jest-silent-reporter"],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest-setup.js'],
  verbose: true,
  testURL: 'http://localhost/',
  preset: "ts-jest/presets/js-with-babel-esm",
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};


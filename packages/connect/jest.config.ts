import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  coverageReporters: ["text-summary"],
  reporters: ["jest-silent-reporter"],
  resolver: "./extension-resolver.cjs",
  roots: ['<rootDir>/src'],
  verbose: true,
  transformIgnorePatterns:["./src/__mocks__/client.js"],
  testURL: "http://localhost/",
  preset: "ts-jest/presets/js-with-babel-esm",
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
export default config;

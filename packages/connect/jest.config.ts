import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  coverageReporters: ["text-summary"],
  reporters: ["jest-silent-reporter"],
  roots: ['<rootDir>/dist'],
  verbose: true,
  transformIgnorePatterns:["./src/__mocks__/client.js"],
  testURL: "http://localhost/"
};
export default config;

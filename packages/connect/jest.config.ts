import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/dist'],
  verbose: true,
  transformIgnorePatterns:["./src/__mocks__/client.js"],
  testURL: "http://localhost/",
  transform: {}
};
export default config;

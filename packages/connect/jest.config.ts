import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  transformIgnorePatterns:["./src/__mocks__/client.js"],
  testURL: "http://localhost/",
  transform: {},
  extensionsToTreatAsEsm: [".ts", ".tsx"]
};
export default config;

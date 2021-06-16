import type {Config} from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  transformIgnorePatterns:["./src/__mocks__/client.js"],
  testURL: "http://localhost/",
  transform: {},
  extensionsToTreatAsEsm: [".ts", ".tsx"]
};

if (process.env.GITHUB_ACTIONS) {
  config.testPathIgnorePatterns = [
    "dist/Detector.test.js",
    "dist/SmoldotProvider/examples/api.test.js",
  ]
}

export default config;

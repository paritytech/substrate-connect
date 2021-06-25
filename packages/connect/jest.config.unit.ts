import config from './jest.config';

const configUnit = Object.assign({}, config, { testPathIgnorePatterns: [
  "src/Detector.test.ts",
  "src/SmoldotProvider/examples/api.test.ts"
  ]
});

export default configUnit;

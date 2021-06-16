import config from './jest.config';

const configUnit = Object.assign({}, config, { testPathIgnorePatterns: [
  "dist/Detector.test.js",
  "dist/SmoldotProvider/examples/api.test.js"
  ]
});

export default configUnit;

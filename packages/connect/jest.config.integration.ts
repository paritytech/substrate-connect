import config from './jest.config';

const configIntegration = Object.assign({}, config, { testPathIgnorePatterns: [
  "dist/ExtensionProvider/ExtensionProvider.test.js",
  "dist/SmoldotProvider/SmoldotProvider.test.js",
  "dist/utils/utils.test.js"
]
});

export default configIntegration;

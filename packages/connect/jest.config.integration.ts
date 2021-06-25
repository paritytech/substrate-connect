import config from './jest.config';

const configIntegration = Object.assign({}, config, { testPathIgnorePatterns: [
  "src/ExtensionProvider/ExtensionProvider.test.ts",
  "src/SmoldotProvider/SmoldotProvider.test.ts",
  "src/utils/utils.test.ts"
]
});

export default configIntegration;

export default {
    preset: "ts-jest",
    testEnvironment: 'node',
    transform: {},
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.test.json'
      }
    }
  };

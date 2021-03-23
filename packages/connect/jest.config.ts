export default {
  preset: "ts-jest",
  testEnvironment: 'node',
  transform: {},
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  setupFiles: ["./src/__mocks__/client.js"],
  verbose: true,
  testURL: "http://localhost/"
};

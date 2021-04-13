export default {
  preset: "ts-jest",
  testEnvironment: 'node',
  transform: {
     "\\.[jt]sx?$": "babel-jest"
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  verbose: true,
  testURL: "http://localhost/"
};

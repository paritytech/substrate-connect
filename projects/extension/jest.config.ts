export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest-setup.js'],
  transform: {
     '\.[jt]sx?$': 'babel-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  verbose: true,
  testURL: 'http://localhost/'
};

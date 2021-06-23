export default {
  coverageReporters: ["text-summary"],
  reporters: ["jest-silent-reporter"],
  transform: {},
  testEnvironment: 'jsdom',
  moduleFileExtensions: ["js", "jsx"],
  setupFilesAfterEnv: ['./jest-setup.js'],
  verbose: true,
  testURL: 'http://localhost/'
};


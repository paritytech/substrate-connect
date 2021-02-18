import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // The root of your source code, typically /src
  roots: ["<rootDir>/src"],
  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  // Runs special logic, such as cleaning up components
  // when using React Testing Library and adds special
  // extended assertions to Jest
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // Test spec file resolution pattern
  // Matches tests and filename on file format: filaname.test.tsx
  testMatch: ["**/?(*.)(spec|test).ts?(x)"],
  // Module file extensions for importing
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};

export default config;

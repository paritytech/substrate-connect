import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // The root of your source code, typically /src
  roots: ["<rootDir>/src"],
  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
  // Test spec file resolution pattern
  // Matches tests and filename on file format: filaname.test.tsx
  testMatch: ["**/?(*.)(spec|test).ts?(x)"],
  // Module file extensions for importing
  moduleFileExtensions: ["ts", "js", "json", "node"]
};

export default config;
import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  testEnvironment: "jsdom",
  resolver: "./extension-resolver.cjs",
  roots: ["<rootDir>/src"],
  verbose: true,
  testURL: "http://localhost/",
  preset: "ts-jest/presets/js-with-babel-esm",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
}
export default config

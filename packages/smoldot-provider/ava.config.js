// Typings arent available for next gen config yet
export default {
  nonSemVerExperiments: {
    nextGenConfig: true,
    configurableModuleFormat: true
  },
  files: [
    'src/**/*.test.ts',
    '!src/examples'
  ],
  extensions: {
    ts: "module"
  },
  nodeArguments: [
    "--no-warnings",
    "--loader=ts-node/esm",
    "--experimental-specifier-resolution=node"
  ],
  require: [
    "ts-node/register"
  ]
};

// Typings arent available for next gen config yet
// Until next gen config is more stable we have to duplicate all the config :(
export default {
  nonSemVerExperiments: {
    nextGenConfig: true,
    configurableModuleFormat: true
  },
  files: [
    'src/examples/**/*.test.ts'
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

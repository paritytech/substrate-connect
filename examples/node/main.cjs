const { createScClient, WellKnownChain } = require("@substrate/connect")
const { Worker } = require("node:worker_threads")

createScClient({
  embeddedNodeConfig: {
    workerFactory: () => new Worker("./worker.cjs"),
  },
})
  .addWellKnownChain(WellKnownChain.polkadot, (response) =>
    console.log({ response }),
  )
  .then((chain) => {
    chain.sendJsonRpc(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "chainHead_unstable_follow",
        params: [true],
      }),
    )
  })

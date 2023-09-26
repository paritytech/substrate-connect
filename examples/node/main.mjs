import { createScClient, WellKnownChain } from "@substrate/connect"
import { Worker } from "node:worker_threads"

createScClient({
  embeddedNodeConfig: {
    workerFactory: () => new Worker("./worker.mjs"),
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

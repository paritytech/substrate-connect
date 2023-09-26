import { createScClient, WellKnownChain } from "@substrate/connect"

createScClient()
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

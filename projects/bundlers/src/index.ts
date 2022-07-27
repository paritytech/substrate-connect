import "regenerator-runtime/runtime"
import UI, { emojis } from "./view"
import { createScClient, WellKnownChain } from "@substrate/connect";

window.onload = () => {
  const loadTime = performance.now()
  const ui = new UI({ containerId: "messages" }, { loadTime })
  void (async () => {
    try {
      const start = async () => {
        const scClient = createScClient();
        const westendChain = await scClient.addWellKnownChain(
          WellKnownChain.westend2,
          function jsonRpcCallback(response) {
            ui.log(response)
          }
        );
        westendChain.sendJsonRpc(
          '{"jsonrpc":"2.0","id":"1","method":"chainHead_unstable_follow","params":[true]}',
        );
      }
      start();
      ui.log(`${emojis.seedling} Light client ready`)
      ui.log(
        `${emojis.info} Connected to Westend`,
      )
    } catch (error) {
      ui.error(<Error>error)
    }
  })()
}

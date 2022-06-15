import "regenerator-runtime/runtime"
import { createScClient, WellKnownChain } from "@substrate/connect"
import UI from "./view"

interface UiElements {
  auth: HTMLElement | null
  spec: HTMLElement | null
  trans: HTMLElement | null
  newBlock: HTMLElement | null
  best: HTMLElement | null
  finalized: HTMLElement | null
}

const getStruct = (name: string): UiElements => ({
  auth: document.getElementById(name + "Auth"),
  spec: document.getElementById(name + "Spec"),
  trans: document.getElementById(name + "Trans"),
  newBlock: document.getElementById(name + "New"),
  best: document.getElementById(name + "Best"),
  finalized: document.getElementById(name + "Finalized"),
})

window.onload = () => {
  const loadTime = performance.now()
  const ui = new UI({ containerId: "messages" }, { loadTime })
  ui.showSyncing()

  const polka = getStruct("polkadot")
  const west = getStruct("westend")

  const showStuffInUI = (who: UiElements, what: string) => {
    const json = JSON.parse(what)
    switch (json.event) {
      case "initialized":
        if (who.auth)
          who.auth.innerText = JSON.stringify(
            json.finalizedBlockRuntime.spec.authoringVersion,
          )
        if (who.spec)
          who.spec.innerText = JSON.stringify(
            json.finalizedBlockRuntime.spec.specVersion,
          )
        if (who.trans)
          who.trans.innerText = JSON.stringify(
            json.finalizedBlockRuntime.spec.transactionVersion,
          )

        break
      case "newBlock":
        if (who.newBlock)
          who.newBlock.innerText = JSON.stringify(json.blockHash)
        break
      case "bestBlockChanged":
        if (who.best) who.best.innerText = JSON.stringify(json.bestBlockHash)
        break
      case "finalized":
        if (who.finalized)
          who.finalized.innerText = JSON.stringify(
            json.finalizedBlocksHashes.join(),
          )
        break
    }
  }

  void (async () => {
    try {
      const scClient = createScClient()
      const polkadotChain = await scClient.addWellKnownChain(
        WellKnownChain.polkadot,
        function jsonRpcCallback(response) {
          console.log("response", JSON.parse(response).params.result)
          showStuffInUI(
            polka,
            JSON.stringify(JSON.parse(response).params.result),
          )
        },
      )

      const westendChain = await scClient.addWellKnownChain(
        WellKnownChain.westend2,
        function jsonRpcCallback(response) {
          showStuffInUI(
            west,
            JSON.stringify(JSON.parse(response).params.result),
          )
        },
      )

      polkadotChain.sendJsonRpc(
        '{"jsonrpc":"2.0","id":"1","method":"chainHead_unstable_follow","params":[true]}',
      )
      westendChain.sendJsonRpc(
        '{"jsonrpc":"2.0","id":"1","method":"chainHead_unstable_follow","params":[true]}',
      )
    } catch (error) {
      ui.error(error as Error)
    }
  })()
}

import { compact } from "scale-ts"
import { fromHex } from "@unstoppablejs/utils"
import { WellKnownChain } from "@substrate/connect"
import { createClient } from "@capi-dev/substrate-client"
import { ScProvider } from "./ScProvider"
import westmint from "./assets/westend-westmint.json"
import UI, { emojis } from "./view"
;(
  [
    [WellKnownChain.polkadot, document.getElementById("polkadot")!],
    [WellKnownChain.ksmcc3, document.getElementById("kusama")!],
    [WellKnownChain.westend2, document.getElementById("westend")!],
  ] as const
).forEach(([scProviderInput, uiElement]) => {
  const provider = ScProvider(scProviderInput)
  const client = createClient(provider)
  const follow = client.chainHead(
    true,
    (event) => {
      if (event.event === "initialized") {
        follow.header(event.finalizedBlockHash).then((result) => {
          if (!result) return
          uiElement.innerText = `# ${compact.dec(fromHex(result).slice(32))}`
        })
      } else if (event.event === "bestBlockChanged") {
        follow.header(event.bestBlockHash).then((result) => {
          if (!result) return
          uiElement.innerText = `# ${compact.dec(fromHex(result).slice(32))}`
        })
      }
    },
    (error) => console.error(error),
  )
})

await new Promise((resolve) => setTimeout(resolve, 5_000))
{
  const ui = new UI(
    { containerId: "messages" },
    { loadTime: performance.now() },
  )
  ui.showSyncing()
  const uiElement = document.getElementById("westmint")!
  const provider = ScProvider(JSON.stringify(westmint))
  const client = createClient(provider)

  const follow = client.chainHead(
    true,
    (event) => {
      if (event.event === "initialized") {
        ui.log(
          // @ts-ignore
          `${emojis.seedling} Light client ready - Using ${event.finalizedBlockRuntime.spec.specName}/${event.finalizedBlockRuntime.spec.specVersion}`,
          true,
        )
        follow.header(event.finalizedBlockHash).then((result) => {
          if (!result) return
          const blockHeight = compact.dec(fromHex(result).slice(32))
          uiElement.innerText = `# ${blockHeight}`
        })
        client._request("system_health", [], {
          onSuccess(result: any) {
            const peers =
              result.peers === 1 ? "1 peer" : `${result.peers} peers`
            ui.log(`${emojis.stethoscope} Parachain is syncing with ${peers}`)
          },
          onError(error) {
            console.error(error)
          },
        })
        client._request("chainSpec_v1_chainName", [], {
          onSuccess(result) {
            ui.log(`${emojis.info} Connected to ${result}`)
          },
          onError(error) {
            console.error(error)
          },
        })
        client._request("chainSpec_v1_genesisHash", [], {
          onSuccess(result) {
            ui.log(`${emojis.chequeredFlag} Genesis hash is ${result}`)
          },
          onError(error) {
            console.error(error)
          },
        })
        client._request("chainSpec_v1_properties", [], {
          onSuccess(result: any) {
            ui.log(
              `${emojis.chequeredFlag} Token decimals: ${result.tokenDecimals} - symbol: ${result.tokenSymbol}`,
            )
          },
          onError(error) {
            console.error(error)
          },
        })
        setInterval(() => {
          client._request("system_health", [], {
            onSuccess(result: any) {
              result.isSyncing ? ui.showSyncing() : ui.showSynced()
            },
            onError(error) {
              console.error(error)
            },
          })
        }, 2_000)
      } else if (event.event === "bestBlockChanged") {
        follow.header(event.bestBlockHash).then((result) => {
          if (!result) return
          uiElement.innerText = `# ${compact.dec(fromHex(result).slice(32))}`
        })
      }
    },
    (error) => console.error("[westmint]", error),
  )
}

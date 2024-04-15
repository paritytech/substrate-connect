import {
  Chain,
  createScClient,
  ScClient,
  WellKnownChain,
  JsonRpcCallback,
} from "@substrate/connect"
import { createClient } from "@polkadot-api/substrate-client"
import { getObservableClient } from "@polkadot-api/observable-client"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import { filter, map } from "rxjs"

import UI, { emojis } from "./view"

import {
  polkadot_asset_hub as assetHubPolkadot,
  westend2_asset_hub as assetHubWestend,
  ksmcc3_asset_hub as assetHubKusama,
} from "@substrate/connect-known-chains"

window.onload = () => {
  ;(
    [
      [[WellKnownChain.polkadot], "polkadot"],
      [[WellKnownChain.ksmcc3], "kusama"],
      [[WellKnownChain.westend2], "westend"],
      [[assetHubPolkadot, WellKnownChain.polkadot], "asset-hub-polkadot"],
      [[assetHubKusama, WellKnownChain.ksmcc3], "asset-hub-kusama"],
      [[assetHubWestend, WellKnownChain.westend2], "asset-hub-westend"],
    ] as [[spec: string, relaySpec?: string], elementId: string][]
  ).forEach(([specs, elementId]) => followChainBestBlocks(specs, elementId))

  showAssetHubPolkadotChainDetails()
}

const followChainBestBlocks = (
  [wellKnownChainOrChainSpec, wellKnownChainOrRelayChainSpec]: [
    wellKnownChainOrChainSpec: string,
    wellKnownChainOrRelayChainSpec?: string,
  ],
  elementId: string,
) => {
  const ui = document.getElementById(elementId)
  if (!ui) return

  const client = createClient(
    ScProvider(wellKnownChainOrChainSpec, wellKnownChainOrRelayChainSpec),
  )

  getObservableClient(client)
    .chainHead$()
    .bestBlocks$.pipe(
      map((blocks) => blocks[0]),
      filter(Boolean),
    )
    .subscribe(({ number }) => {
      ui.setAttribute("data-blockheight", `${number}`)
      ui.innerText = `#${number}`
    })
}

const showAssetHubPolkadotChainDetails = async () => {
  const ui = new UI(
    { containerId: "messages" },
    { loadTime: performance.now() },
  )
  ui.showSyncing()

  const client = createClient(
    ScProvider(assetHubPolkadot, WellKnownChain.polkadot),
  )

  getObservableClient(client)
    .chainHead$()
    .follow$.subscribe(async (event) => {
      if (event.type !== "initialized") return
      ui.showSynced()
      const [genesisHash, chainName, properties] = (await Promise.all(
        [
          "chainSpec_v1_genesisHash",
          "chainSpec_v1_chainName",
          "chainSpec_v1_properties",
        ].map(
          (method) =>
            new Promise((resolve, reject) =>
              client._request(method, [], {
                onSuccess: resolve,
                onError: reject,
              }),
            ),
        ),
      )) as [string, string, any]

      ui.log(`${emojis.seedling} Light client ready`, true)
      ui.log(`${emojis.info} Connected to ${chainName}`)
      ui.log(
        `${emojis.chequeredFlag} Token decimals: ${properties?.tokenDecimals} - symbol: ${properties?.tokenSymbol}`,
      )
      ui.log(`${emojis.chequeredFlag} Genesis hash is ${genesisHash}`)
      client._request("system_health", [], {
        onSuccess(health: { peers: number }) {
          const peers = `${health.peers} ${
            health.peers === 1 ? "peer" : "peers"
          }`
          ui.log(`${emojis.stethoscope} Parachain is syncing with ${peers}`)
        },
        onError(error) {
          console.error(error)
        },
      })
    })
}

const wellKnownChains: ReadonlySet<string> = new Set<WellKnownChain>(
  Object.values(WellKnownChain),
)
const isWellKnownChain = (input: string): input is WellKnownChain =>
  wellKnownChains.has(input)
const noop = () => {}

let client: ScClient
const ScProvider = (input: string, relayChainSpec?: string) => {
  client ??= createScClient()
  const addChain = (input: string, jsonRpcCallback?: JsonRpcCallback) =>
    isWellKnownChain(input)
      ? client.addWellKnownChain(input, jsonRpcCallback)
      : client.addChain(input, jsonRpcCallback)

  return getSyncProvider(async () => {
    let listener: (message: string) => void = noop
    const onMessage = (msg: string) => {
      listener(msg)
    }

    let chain: Chain
    try {
      const relayChain = relayChainSpec
        ? await addChain(relayChainSpec)
        : undefined
      chain = relayChain
        ? await relayChain.addChain(input, onMessage)
        : await addChain(input, onMessage)
    } catch (e) {
      console.warn(
        `couldn't create chain with: ${input} ${relayChainSpec ?? ""}`,
      )
      console.error(e)
      throw e
    }

    return (onMessage) => {
      listener = onMessage
      return {
        send(msg: string) {
          chain.sendJsonRpc(msg)
        },
        disconnect() {
          listener = noop
          chain.remove()
        },
      }
    }
  })
}

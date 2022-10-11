import settings from "./settings.json"

import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2_2 from "../../public/assets/rococo_v2_2.json"

import { ToContentScript, ToExtension } from "./protocol"
import * as environment from "../environment"

// Loads the well-known chains bootnodes from the local storage and returns the well-known
// chains.
const loadWellKnownChains = async (): Promise<Map<string, string>> => {
  let polkadot_cp = Object.assign({}, polkadot)
  let ksmcc3_cp = Object.assign({}, ksmcc3)
  let westend2_cp = Object.assign({}, westend2)
  let rococo_cp = Object.assign({}, rococo_v2_2)

  const polkadotBootnodes = await environment.get({
    type: "bootnodes",
    chainName: polkadot_cp.id,
  })
  if (polkadotBootnodes) {
    polkadot_cp.bootNodes = polkadotBootnodes
  }

  const ksmcc3Bootnodes = await environment.get({
    type: "bootnodes",
    chainName: ksmcc3_cp.id,
  })
  if (ksmcc3Bootnodes) {
    ksmcc3_cp.bootNodes = ksmcc3Bootnodes
  }

  const westend2Bootnodes = await environment.get({
    type: "bootnodes",
    chainName: westend2_cp.id,
  })
  if (westend2Bootnodes) {
    westend2_cp.bootNodes = westend2Bootnodes
  }

  const rococoBootnodes = await environment.get({
    type: "bootnodes",
    chainName: rococo_cp.id,
  })
  if (rococoBootnodes) {
    rococo_cp.bootNodes = rococoBootnodes
  }

  // Note that this list doesn't necessarily always have to match the list of well-known
  // chains in `@substrate/connect`. The list of well-known chains is not part of the stability
  // guarantees of the connect <-> extension protocol and is thus allowed to change
  // between versions of the extension. For this reason, we don't use the `WellKnownChain`
  // enum from `@substrate/connect` but instead manually make the list in that enum match
  // the list present here.
  return new Map<string, string>([
    [polkadot_cp.id, JSON.stringify(polkadot_cp)],
    [ksmcc3_cp.id, JSON.stringify(ksmcc3_cp)],
    [rococo_cp.id, JSON.stringify(rococo_cp)],
    [westend2_cp.id, JSON.stringify(westend2_cp)],
  ])
}

chrome.runtime.onMessage.addListener(
  (message: ToExtension, sender, sendResponse) => {
    switch (message.type) {
      case "get-well-known-chain": {
        // TODO: don't load the list every time
        loadWellKnownChains().then((map) => {
          const chainSpec = map.get(message.chainName)
          if (chainSpec) {
            environment
              .get({ type: "database", chainName: message.chainName })
              .then((databaseContent) => {
                sendResponse({
                  type: "get-well-known-chain",
                  found: { chainSpec, databaseContent: databaseContent || "" },
                } as ToContentScript)
              })
          } else {
            sendResponse({
              type: "get-well-known-chain",
              chainName: message.chainName,
            } as ToContentScript)
          }
        })

        // `true` must be returned to indicate that there will be a response.
        return true
      }

      case "tab-reset": {
        environment.remove({ type: "activeChains", tabId: sender.tab!.id! }).then(() => {
          sendResponse(null)
        })
        // `true` must be returned to indicate that there will be a response.
        return true
      }

      case "add-chain": {
        environment.get({ type: "activeChains", tabId: sender.tab!.id! }).then(async (chains) => {
          if (!chains) chains = []

          chains.push({
            chainId: message.chainId,
            chainName: message.chainSpecChainName,
            isSyncing: false,
            peers: 0,
            tab: {
              id: sender.tab!.id!,
              url: sender.tab!.url!,
            },
          })

          await environment.set({ type: "activeChains", tabId: sender.tab!.id! }, chains)
          sendResponse(null)
        })
        // `true` must be returned to indicate that there will be a response.
        return true
      }

      case "chain-info-update": {
        environment.get({ type: "activeChains", tabId: sender.tab!.id! }).then(async (chains) => {
          if (!chains) return

          const pos = chains.findIndex(
            (c) =>
              c.tab.id === sender.tab!.id! && c.chainId === message.chainId,
          )
          if (pos !== -1) {
            chains[pos].peers = message.peers
            chains[pos].bestBlockHeight = message.bestBlockNumber
          }

          await environment.set({ type: "activeChains", tabId: sender.tab!.id! }, chains)
          sendResponse(null)
        })
        // `true` must be returned to indicate that there will be a response.
        return true
      }

      case "database-content": {
        environment.set(
          { type: "database", chainName: message.chainName },
          message.databaseContent,
        )
        sendResponse(null)
        return false
      }

      case "remove-chain": {
        environment.get({ type: "activeChains", tabId: sender.tab!.id! }).then(async (chains) => {
          if (!chains) return
          const pos = chains.findIndex(
            (c) =>
              c.tab.id === sender.tab!.id! && c.chainId === message.chainId,
          )
          if (pos !== -1) chains.splice(pos, 1)
          await environment.set({ type: "activeChains", tabId: sender.tab!.id! }, chains)
          sendResponse(null)
        })
        // `true` must be returned to indicate that there will be a response.
        return true
      }
    }
  },
)

chrome.tabs.onRemoved.addListener((tabId) => {
  environment.remove({ type: "activeChains", tabId })
})

// Callback called when the browser starts.
// Note: technically, this is triggered when a new profile is started. But since each profile has
// its own local storage, this fits the mental model of "browser starts".
chrome.runtime.onStartup.addListener(() => {
  // TODO: ?!?! why do we need to do this?
  environment.get({ type: "notifications" }).then((result) => {
    if (!result)
      environment.set({ type: "notifications" }, settings.notifications)
  })

  // Note: there is clearly a race condition here because we can start processing tab messages
  // before the promise has finished.
  environment.clearAllActiveChains()
})

import settings from "./settings.json"
import { ExposedChainConnection } from "./types"

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

  const polkadotBootnodes = await environment.get({ type: "bootnodes", chainName: polkadot_cp.id });
  if (polkadotBootnodes) {
    polkadot_cp.bootNodes = polkadotBootnodes
  }

  const ksmcc3Bootnodes = await environment.get({ type: "bootnodes", chainName: ksmcc3_cp.id });
  if (ksmcc3Bootnodes) {
    ksmcc3_cp.bootNodes = ksmcc3Bootnodes
  }

  const westend2Bootnodes = await environment.get({ type: "bootnodes", chainName: westend2_cp.id });
  if (westend2Bootnodes) {
    westend2_cp.bootNodes = westend2Bootnodes
  }

  const rococoBootnodes = await environment.get({ type: "bootnodes", chainName: rococo_cp.id });
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

export interface Background extends Window {
  uiInterface: {
    onChainsChanged: (listener: () => void) => () => void
    // List of all chains that are currently running.
    // Use `onChainsChanged` to register a callback that is called when this list or its content
    // might have changed.
    get chains(): ExposedChainConnection[]
  }
}

const chains: Map<
  number, // Tab ID
  {
    tabUrl: string
    chains: Map<
      string,
      {
        chainName: string
        peers: number
        bestBlockNumber?: number
      }
    >
  }
> = new Map()

// Listeners that must be notified when the `get chains()` getter would return a different value.
const chainsChangedListeners: Set<() => void> = new Set()
const notifyAllChainsChangedListeners = () => {
  chainsChangedListeners.forEach((l) => {
    try {
      l()
    } catch (e) {
      console.error("Uncaught exception in onChainsChanged callback:", e)
    }
  })
}

declare let window: Background
window.uiInterface = {
  onChainsChanged(listener) {
    chainsChangedListeners.add(listener)
    return () => {
      chainsChangedListeners.delete(listener)
    }
  },
  get chains(): ExposedChainConnection[] {
    const out: ExposedChainConnection[] = []
    for (const [tabId, tabInfo] of Array.from(chains.entries())) {
      for (const [chainId, info] of Array.from(tabInfo.chains.entries())) {
        out.push({
          chainId,
          chainName: info.chainName,
          isSyncing: false,
          peers: info.peers,
          bestBlockHeight: info.bestBlockNumber,
          tab: {
            id: tabId,
            url: tabInfo.tabUrl,
          },
        })
      }
    }
    return out
  }
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
        break
      }

      case "tab-reset": {
        chains.delete(sender.tab!.id!)
        break
      }

      case "add-chain": {
        if (!chains.has(sender.tab!.id!))
          chains.set(sender.tab!.id!, {
            chains: new Map(),
            tabUrl: sender.tab!.url!,
          })

        chains.get(sender.tab!.id!)!.chains.set(message.chainId, {
          chainName: message.chainSpecChainName,
          peers: 0,
        })
        notifyAllChainsChangedListeners()
        break
      }

      case "chain-info-update": {
        const info = chains.get(sender.tab!.id!)!.chains.get(message.chainId)!
        info.peers = message.peers
        info.bestBlockNumber = message.bestBlockNumber
        notifyAllChainsChangedListeners()
        break
      }

      case "database-content": {
        environment.set({ type: "database", chainName: message.chainName }, message.databaseContent)
        break
      }

      case "remove-chain": {
        chains.get(sender.tab!.id!)!.chains.delete(message.chainId)
        notifyAllChainsChangedListeners()
        break
      }
    }
  },
)

chrome.tabs.onRemoved.addListener((tabId) => {
  chains.delete(tabId)
})

// TODO: ?!?! why do we need to do this?
environment.get({ type: "notifications" })
  .then((result) => {
    if (!result)
      environment.set({ type: "notifications" }, settings.notifications)
  })

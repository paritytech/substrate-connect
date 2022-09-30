import settings from "./settings.json"
import { ExposedChainConnection } from "./types"

import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2_2 from "../../public/assets/rococo_v2_2.json"

import { ToContentScript, ToExtension } from "./protocol"

// Loads the well-known chains bootnodes from the local storage and returns the well-known
// chains.
const loadWellKnownChains = (): Promise<Map<string, string>> => {
  let resolve: undefined | ((list: Map<string, string>) => void)
  const promise = new Promise<Map<string, string>>((r) => (resolve = r))

  let polkadot_cp = Object.assign({}, polkadot)
  let ksmcc3_cp = Object.assign({}, ksmcc3)
  let westend2_cp = Object.assign({}, westend2)
  let rococo_cp = Object.assign({}, rococo_v2_2)

  chrome.storage.local.get(
    [
      "bootNodes_".concat(polkadot_cp.id),
      "bootNodes_".concat(ksmcc3_cp.id),
      "bootNodes_".concat(westend2_cp.id),
      "bootNodes_".concat(rococo_cp.id),
    ],
    (result) => {
      let i = "bootNodes_".concat(polkadot_cp.id)
      if (result[i]) {
        polkadot_cp.bootNodes = result[i]
      }
      i = "bootNodes_".concat(ksmcc3_cp.id)
      if (result[i]) {
        ksmcc3_cp.bootNodes = result[i]
      }
      i = "bootNodes_".concat(westend2_cp.id)
      if (result[i]) {
        westend2_cp.bootNodes = result[i]
      }
      i = "bootNodes_".concat(rococo_cp.id)
      if (result[i]) {
        rococo_cp.bootNodes = result[i]
      }

      // Note that this list doesn't necessarily always have to match the list of well-known
      // chains in `@substrate/connect`. The list of well-known chains is not part of the stability
      // guarantees of the connect <-> extension protocol and is thus allowed to change
      // between versions of the extension. For this reason, we don't use the `WellKnownChain`
      // enum from `@substrate/connect` but instead manually make the list in that enum match
      // the list present here.
      resolve!(
        new Map<string, string>([
          [polkadot_cp.id, JSON.stringify(polkadot_cp)],
          [ksmcc3_cp.id, JSON.stringify(ksmcc3_cp)],
          [rococo_cp.id, JSON.stringify(rococo_cp)],
          [westend2_cp.id, JSON.stringify(westend2_cp)],
        ]),
      )
    },
  )

  return promise
}

export interface Background extends Window {
  uiInterface: {
    onChainsChanged: (listener: () => void) => () => void
    setChromeStorageLocalSetting: (obj: any) => void
    getChromeStorageLocalSetting(
      setting: string,
    ): Promise<{ [key: string]: any }>
    // List of all chains that are currently running.
    // Use `onChainsChanged` to register a callback that is called when this list or its content
    // might have changed.
    get chains(): ExposedChainConnection[]
    // Get the bootnodes of the wellKnownChains
    get wellKnownChainBootnodes(): Promise<Record<string, string[]>>
  }
}

const chains: Map<
  number,  // Tab ID
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
  setChromeStorageLocalSetting: (obj: any) => {
    chrome.storage.local.set(obj, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  },
  getChromeStorageLocalSetting(setting: string) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([setting], (res) => {
        resolve(res)
      })
    })
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
  },

  get wellKnownChainBootnodes() {
    return loadWellKnownChains().then((list) => {
      let output: Record<string, string[]> = {}
      for (const chainSpec of list.values()) {
        const parsed = JSON.parse(chainSpec)
        output[parsed.id as string] = parsed.bootNodes as string[]
      }
      return output
    })
  },
}

chrome.runtime.onMessage.addListener((message: ToExtension, sender, sendResponse) => {
  switch (message.type) {
    case "get-well-known-chain": {
      // TODO: don't load the list every time
      loadWellKnownChains().then((map) => {
        const chainSpec = map.get(message.chainName)
        if (chainSpec) {
          chrome.storage.local.get(
            [message.chainName],
            (storageGetResult) => {
              const databaseContent = storageGetResult[
                message.chainName
              ] as string
              sendResponse({
                type: "get-well-known-chain",
                found: { chainSpec, databaseContent },
              } as ToContentScript)
            },
          )
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
      chains.delete(sender.tab!.id!);
      break;
    }

    case "add-chain": {
      if (!chains.has(sender.tab!.id!))
        chains.set(sender.tab!.id!, { chains: new Map(), tabUrl: sender.tab!.url! });

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
      chrome.storage.local.set({
        [message.chainName]: message.databaseContent,
      })
      break
    }

    case "remove-chain": {
      chains.get(sender.tab!.id!)!.chains.delete(message.chainId)
      notifyAllChainsChangedListeners()
      break
    }
  }
})

chrome.tabs.onRemoved.addListener((tabId) => {
  chains.delete(tabId);
})

chrome.storage.local.get(["notifications"], (result) => {
  if (Object.keys(result).length === 0) {
    // Setup default settings
    chrome.storage.local.set({ notifications: settings.notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }
})

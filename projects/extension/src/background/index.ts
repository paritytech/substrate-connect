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
    onSmoldotCrashErrorChanged: (listener: () => void) => () => void
    disconnectTab: (tabId: number) => void
    setChromeStorageLocalSetting: (obj: any) => void
    getChromeStorageLocalSetting(
      setting: string,
    ): Promise<{ [key: string]: any }>
    // List of all chains that are currently running.
    // Use `onChainsChanged` to register a callback that is called when this list or its content
    // might have changed.
    get chains(): ExposedChainConnection[]
    get logger(): LogKeeper
    // If smoldot has crashed, contains a string containing a crash message.
    // Use `onSmoldotCrashErrorChanged` to register a callback that is called when this crash
    // message might have changed.
    get smoldotCrashError(): string | undefined
    // Get the bootnodes of the wellKnownChains
    get wellKnownChainBootnodes(): Promise<Record<string, string[]>>
  }
}

interface logStructure {
  unix_timestamp: number
  level: number
  target: string
  message: string
}

interface LogKeeper {
  all: logStructure[]
  warn: logStructure[]
  error: logStructure[]
}

const chains: Map<
  chrome.runtime.Port,
  {
    tabId: number
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
  onSmoldotCrashErrorChanged(_listener) {
    // TODO: remove
    return () => {}
  },
  disconnectTab: (_tabId: number) => {
    // TODO: remove
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
    for (const tab of Array.from(chains.values())) {
      for (const [chainId, info] of Array.from(tab.chains.entries())) {
        out.push({
          chainId,
          chainName: info.chainName,
          isSyncing: false,
          peers: info.peers,
          bestBlockHeight: info.bestBlockNumber,
          tab: {
            id: tab.tabId,
            url: tab.tabUrl,
          },
        })
      }
    }
    return out
  },
  get logger() {
    return {
      all: [],
      warn: [],
      error: [],
    }
  },
  get smoldotCrashError() {
    return undefined
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

// Handle new port connections.
//
// Whenever a tab starts using the substrate-connect extension, it will open a port. This is caught
// here.
chrome.runtime.onConnect.addListener((port) => {
  chains.set(port, {
    tabId: port.sender!.tab!.id!,
    tabUrl: port.sender!.tab!.url!,
    chains: new Map(),
  })

  port.onMessage.addListener((message: ToExtension) => {
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
                port.postMessage({
                  type: "get-well-known-chain",
                  chainName: message.chainName,
                  found: { chainSpec, databaseContent },
                } as ToContentScript)
              },
            )
          } else {
            port.postMessage({
              type: "get-well-known-chain",
              chainName: message.chainName,
            } as ToContentScript)
          }
        })
        break
      }

      case "add-chain": {
        chains.get(port)!.chains.set(message.chainId, {
          chainName: message.chainSpecChainName,
          peers: 0,
        })
        notifyAllChainsChangedListeners()
        break
      }

      case "chain-info-update": {
        const info = chains.get(port)!.chains.get(message.chainId)!
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
        chains.get(port)!.chains.delete(message.chainId)
        notifyAllChainsChangedListeners()
        break
      }
    }
  })

  port.onDisconnect.addListener(() => {
    chains.delete(port)
    notifyAllChainsChangedListeners()
  })
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

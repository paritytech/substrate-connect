/* eslint-disable @typescript-eslint/no-floating-promises */

import { wellKnownChains, ConnectionManager } from "./ConnectionManager"
import { logger } from "@polkadot/util"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"
import { ExposedChainConnection } from "./types"
import { start } from "@substrate/smoldot-light"

export interface Background extends Window {
  manager: {
    onManagerStateChanged: (
      listener: (state: ExposedChainConnection[]) => void,
    ) => () => void
    disconnectTab: (tabId: number) => void
  }
}

let manager: ConnectionManager

const publicManager: Background["manager"] = {
  onManagerStateChanged(listener) {
    listener(manager.connections)
    manager.on("stateChanged", listener)
    return () => {
      manager.removeListener("stateChanged", listener)
    }
  },
  disconnectTab: (tabId: number) => manager.disconnectTab(tabId),
}

declare let window: Background
window.manager = publicManager

const l = logger("Extension")
export interface RequestRpcSend {
  method: string
  params: unknown[]
}

const init = async () => {
  try {
    manager = new ConnectionManager(start({ maxLogLevel: 3 }))
    for (const [key, value] of wellKnownChains.entries()) {
      const rpcCallback = (rpc: string) => {
        console.warn(`Got RPC from ${key} dummy chain: ${rpc}`)
      }
      await manager
        .addChain(value, rpcCallback)
        .catch((err) => l.error("Error", err))
    }
  } catch (e) {
    l.error(`Error creating smoldot: ${e}`)
    manager?.shutdown()
  }
}

chrome.runtime.onInstalled.addListener(() => {
  init()
})

chrome.runtime.onStartup.addListener(() => {
  init()
})

chrome.runtime.onConnect.addListener((port) => {
  manager.addChainConnection(port)
})

chrome.storage.local.get(["notifications"], (result) => {
  if (isEmpty(result)) {
    // Setup default settings
    chrome.storage.local.set({ notifications: settings.notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }
})

// TODO (nik): once extension is on chrome/ff stores we need to take advantage
// of the onBrowserUpdateAvailable and onUpdateAvailable lifecycle event
// NOTE: onSuspend could be used to cleanup things but async actions are not guaranteed to complete :(

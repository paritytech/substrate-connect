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
/**
 * The amount of minutes that the DatabaseContentAlarm
 * will rerun
 */
const periodInMinutes = 1

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
      const chain = await manager
        .addChain(value, rpcCallback, undefined, key)
        .catch((err) => l.error("Error", err))
      if (chain) {
        const db = await chain.databaseContent(
          chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
        )
        const keyLow: string = key.toLowerCase()
        chrome.storage.local.set({ keyLow: db })
      }
    }
    /**
     * the alarm will repeat every periodInMinutes minutes after
     * the initial event for DatabaseContentAlarm
     **/
    chrome.alarms.create("DatabaseContentAlarm", {
      periodInMinutes,
    })
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

chrome.alarms.onAlarm.addListener((alarm) => {
  // ensure that the alarm needed is the one set for databaseContent retrieval
  if (alarm.name === "DatabaseContentAlarm") manager.flushDatabases()
})

chrome.runtime.onConnect.addListener((port) => {
  manager.addChainConnection(port)
})

chrome.storage.sync.get(["notifications"], (result) => {
  if (isEmpty(result)) {
    // Setup default settings
    chrome.storage.sync.set({ notifications: settings.notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }
})

// TODO (nik): once extension is on chrome/ff stores we need to take advantage
// of the onBrowserUpdateAvailable and onUpdateAvailable lifecycle event
// NOTE: onSuspend could be used to cleanup things but async actions are not guaranteed to complete :(

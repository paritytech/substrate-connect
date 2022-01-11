import { wellKnownChains, ConnectionManager } from "./ConnectionManager"
import { logger } from "@polkadot/util"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"

export interface Background extends Window {
  manager: ConnectionManager
}

declare let window: Background

const manager = (window.manager = new ConnectionManager())

const l = logger("Extension")
export interface RequestRpcSend {
  method: string
  params: unknown[]
}

const init = async () => {
  try {
    manager.initSmoldot()
    for (const [key, value] of wellKnownChains.entries()) {
      const rpcCallback = (rpc: string) => {
        console.warn(`Got RPC from ${key} dummy chain: ${rpc}`)
      }
      await manager
        .addChain(value, rpcCallback)
        .catch((err) => l.error("Error", err))
    }
    // Once the chains starts create the Database Content alarm
    chrome.alarms.create("DatabaseContentAlarm", {
      periodInMinutes: 10,
    })
    // run init call for getting latest update once all chains are connected
    manager.runAlarm()
  } catch (e) {
    l.error(`Error creating smoldot: ${e}`)
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  // ensure that the alarm needed is the one set for databaseContent retrieval
  if (alarm.name === "DatabaseContentAlarm") manager.runAlarm()
})

chrome.runtime.onInstalled.addListener(() => {
  init().catch(console.error)
})

chrome.runtime.onStartup.addListener(() => {
  init().catch(console.error)
})

chrome.runtime.onConnect.addListener((port) => {
  manager.addApp(port)
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

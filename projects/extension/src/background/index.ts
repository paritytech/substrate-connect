import { ConnectionManager } from "./ConnectionManager"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"

export interface Background extends Window {
  manager: ConnectionManager
}

declare let window: Background

const manager = (window.manager = new ConnectionManager())

chrome.runtime.onInstalled.addListener(() => {
  manager.init().catch(console.error)
})

chrome.runtime.onStartup.addListener(() => {
  manager.init().catch(console.error)
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

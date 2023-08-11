import { ToContentScript, ToExtension } from "./protocol"
import * as environment from "../environment"
import { loadWellKnownChains } from "./loadWellKnownChains"
import { updateDatabases } from "./updateDatabases"

// Callback called when the browser starts.
// Note: technically, this is triggered when a new profile is started. But since each profile has
// its own local storage, this fits the mental model of "browser starts".
chrome.runtime.onStartup.addListener(() => {
  // Note: there is clearly a race condition here because we can start processing tab messages
  // before the promise has finished.
  environment.clearAllActiveChains()
})

chrome.tabs.onRemoved.addListener((tabId) => {
  environment.remove({ type: "activeChains", tabId })
})

// TODO: call updateDatabases()
// updateDatabases()

chrome.alarms.create("DatabaseContentAlarm", {
  periodInMinutes: 1440, // 24 hours
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") updateDatabases()
})

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
        environment
          .remove({ type: "activeChains", tabId: sender.tab!.id! })
          .then(() => {
            sendResponse(null)
          })
        // `true` must be returned to indicate that there will be a response.
        return true
      }

      case "add-chain": {
        environment
          .get({ type: "activeChains", tabId: sender.tab!.id! })
          .then(async (chains) => {
            if (!chains) chains = []

            chains.push({
              chainId: message.chainId,
              isWellKnown: message.isWellKnown,
              chainName: message.chainSpecChainName,
              isSyncing: false,
              peers: 0,
              tab: {
                id: sender.tab!.id!,
                url: sender.tab!.url!,
              },
            })

            await environment.set(
              { type: "activeChains", tabId: sender.tab!.id! },
              chains,
            )
            sendResponse(null)
          })
        // `true` must be returned to indicate that there will be a response.
        return true
      }

      case "chain-info-update": {
        environment
          .get({ type: "activeChains", tabId: sender.tab!.id! })
          .then(async (chains) => {
            if (!chains) return

            const pos = chains.findIndex(
              (c) =>
                c.tab.id === sender.tab!.id! && c.chainId === message.chainId,
            )
            if (pos !== -1) {
              chains[pos].peers = message.peers
              chains[pos].bestBlockHeight = message.bestBlockNumber
            }

            await environment.set(
              { type: "activeChains", tabId: sender.tab!.id! },
              chains,
            )
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
        environment
          .get({ type: "activeChains", tabId: sender.tab!.id! })
          .then(async (chains) => {
            if (!chains) return
            const pos = chains.findIndex(
              (c) =>
                c.tab.id === sender.tab!.id! && c.chainId === message.chainId,
            )
            if (pos !== -1) chains.splice(pos, 1)
            await environment.set(
              { type: "activeChains", tabId: sender.tab!.id! },
              chains,
            )
            sendResponse(null)
          })
        // `true` must be returned to indicate that there will be a response.
        return true
      }
    }
  },
)

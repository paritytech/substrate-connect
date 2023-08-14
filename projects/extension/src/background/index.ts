// import { ToContentScript, ToExtension } from "./protocol"
import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import * as environment from "../environment"
import { updateDatabases } from "./updateDatabases"
import { enqueueAsyncFn } from "./enqueueAsyncFn"
import {
  ChainUpdateEvent,
  ChainWithExtension,
  MalformedJsonRpcError,
  SmoldotClientWithExtension,
} from "./ClientWithExtension"

// TODO: track by TabId
const chains: Record<string, ChainWithExtension> = {}
const tabByChainId: Record<string, chrome.tabs.Tab | undefined> = {}

const removeChain = (chainId: string) => {
  delete chains[chainId]
  delete tabByChainId[chainId]
  if (!chains[chainId]) return
  chains[chainId].remove()
}
const resetTab = (tabId: number) => {
  for (const [chainId, tab] of Object.entries(tabByChainId)) {
    if (tab?.id !== tabId) continue
    removeChain(chainId)
  }
  enqueueAsyncFn(() => environment.remove({ type: "activeChains", tabId }))
}

// Callback called when the browser starts.
// Note: technically, this is triggered when a new profile is started. But since each profile has
// its own local storage, this fits the mental model of "browser starts".
chrome.runtime.onStartup.addListener(() => {
  // Note: there is clearly a race condition here because we can start processing tab messages
  // before the promise has finished.
  environment.clearAllActiveChains()
})

chrome.tabs.onRemoved.addListener(resetTab)

// TODO: call updateDatabases()
// updateDatabases()

chrome.alarms.create("DatabaseContentAlarm", {
  periodInMinutes: 1440, // 24 hours
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") updateDatabases()
})

const sendMessage = (tabId: number, message: ToApplication) => {
  chrome.tabs.sendMessage(tabId, message)
}

const client = new SmoldotClientWithExtension(handleChainUpdate)

type ToBackground = ToExtension | { type: "tab-reset" }
chrome.runtime.onMessage.addListener((msg: ToBackground, sender) => {
  const tabId = sender.tab?.id
  if (!tabId) return
  switch (msg.type) {
    // UI/Storage related
    case "tab-reset": {
      resetTab(tabId)
      return
    }

    case "add-chain":
    case "add-well-known-chain": {
      if (chains[msg.chainId]) {
        sendMessage(tabId, {
          origin: "substrate-connect-extension",
          type: "error",
          chainId: msg.chainId,
          errorMessage: "ChainId already in use",
        })
        return
      }

      tabByChainId[msg.chainId] = sender.tab!

      const jsonRpcCallback = (jsonRpcMessage: string) => {
        sendMessage(tabId, {
          origin: "substrate-connect-extension",
          type: "rpc",
          chainId: msg.chainId,
          jsonRpcMessage,
        })
      }

      const potentialRelayChains =
        msg.type !== "add-chain"
          ? []
          : msg.potentialRelayChainIds
              .filter((c) => chains[c])
              .map((c) => chains[c]!)

      let createChainPromise
      if (msg.type === "add-well-known-chain") {
        createChainPromise = client.addWellKnownChain({
          chainId: msg.chainId,
          chainName: msg.chainName,
          jsonRpcCallback,
          potentialRelayChains,
        })
      } else {
        createChainPromise = client.addChain({
          chainId: msg.chainId,
          chainSpec: msg.chainSpec,
          jsonRpcCallback,
          potentialRelayChains,
        })
      }

      createChainPromise.then(
        (chain) => {
          chains[msg.chainId] = chain
          sendMessage(tabId, {
            origin: "substrate-connect-extension",
            type: "chain-ready",
            chainId: msg.chainId,
          })
        },
        (error) => {
          sendMessage(tabId, {
            origin: "substrate-connect-extension",
            type: "error",
            chainId: msg.chainId,
            errorMessage: error.toString(),
          })
        },
      )

      return
    }

    case "rpc": {
      const chain = chains[msg.chainId]

      // If the chainId is invalid, the message is silently discarded, as documented.
      if (!chain) return

      try {
        chain.sendJsonRpc(msg.jsonRpcMessage)
      } catch (error) {
        // As documented in the protocol, malformed JSON-RPC requests are silently ignored.
        if (error instanceof MalformedJsonRpcError) {
          return
        } else {
          throw error
        }
      }

      return
    }

    case "remove-chain": {
      const chain = chains[msg.chainId]

      // If the chainId is invalid, the message is silently discarded, as documented.
      if (!chain) return

      removeChain(msg.chainId)

      // TODO: delete UI/storage for chain

      return
    }
  }
})

function handleChainUpdate(message: ChainUpdateEvent) {
  enqueueAsyncFn(async () => {
    switch (message.type) {
      case "add-chain": {
        const tab = tabByChainId[message.chainId]
        if (!tab) return
        const chains =
          (await environment.get({
            type: "activeChains",
            tabId: tab.id!,
          })) ?? []

        chains.push({
          chainId: message.chainId,
          isWellKnown: message.isWellKnown,
          chainName: message.chainSpecChainName,
          isSyncing: false,
          peers: 0,
          tab: {
            id: tab.id!,
            url: tab.url!,
          },
        })
        await environment.set({ type: "activeChains", tabId: tab.id! }, chains)

        return
      }
      case "chain-info-update": {
        const tab = tabByChainId[message.chainId]
        if (!tab) return
        const chains = await environment.get({
          type: "activeChains",
          tabId: tab.id!,
        })

        if (!chains) return
        const pos = chains.findIndex(
          (c) => c.tab.id === tab!.id! && c.chainId === message.chainId,
        )
        if (pos !== -1) {
          chains[pos].peers = message.peers
          chains[pos].bestBlockHeight = message.bestBlockNumber
        }
        await environment.set({ type: "activeChains", tabId: tab!.id! }, chains)

        return
      }
      case "database-content": {
        environment.set(
          { type: "database", chainName: message.chainName },
          message.databaseContent,
        )

        return
      }
      case "remove-chain": {
        const tab = tabByChainId[message.chainId]
        if (!tab) return
        const chains = await environment.get({
          type: "activeChains",
          tabId: tab.id!,
        })

        if (!chains) return
        const pos = chains.findIndex(
          (c) => c.tab.id === tab!.id! && c.chainId === message.chainId,
        )
        if (pos !== -1) chains.splice(pos, 1)
        await environment.set({ type: "activeChains", tabId: tab!.id! }, chains)

        return
      }
    }
  })
}

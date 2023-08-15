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
} from "./ClientWithExtension"

import { ChainChannel, ChainMultiplex, ClientService } from "./ClientService"
import { trackChains } from "./trackChains"

// TODO: track by TabId
const chains: Record<string, ChainWithExtension> = {}
const tabByChainId: Record<string, chrome.tabs.Tab | undefined> = {}
const chainsV2: Record<string, ChainMultiplex> = {}
const chainsV2Channels: Record<string, ChainChannel> = {}

const removeChain = (chainId: string) => {
  delete chains[chainId]
  delete tabByChainId[chainId]
  // delete chainsV2Channels[chainId]
  chainsV2[chainId]?.remove()
  delete chainsV2[chainId]
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

const clientService = new ClientService()

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
      if (tabByChainId[msg.chainId]) {
        sendMessage(tabId, {
          origin: "substrate-connect-extension",
          type: "error",
          chainId: msg.chainId,
          errorMessage: "ChainId already in use",
        })
        return
      }

      tabByChainId[msg.chainId] = sender.tab!

      const createChainPromise =
        msg.type === "add-well-known-chain"
          ? clientService.addWellKnownChain(msg.chainId, msg.chainName)
          : clientService.addChain(msg.chainId, {
              chainSpec: msg.chainSpec,
              potentialRelayChains: msg.potentialRelayChainIds
                .filter((c) => chainsV2[c])
                .map((c) => chainsV2[c].smoldotChain),
            })

      createChainPromise.then(
        (chain) => {
          chainsV2[msg.chainId] = chain
          chainsV2Channels[msg.chainId] = chain.channel(
            "app",
            (jsonRpcMessage: string) => {
              sendMessage(tabId, {
                origin: "substrate-connect-extension",
                type: "rpc",
                chainId: msg.chainId,
                jsonRpcMessage,
              })
            },
          )
          sendMessage(tabId, {
            origin: "substrate-connect-extension",
            type: "chain-ready",
            chainId: msg.chainId,
          })
        },
        (error) => {
          delete tabByChainId[msg.chainId]
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
      const chain = chainsV2Channels[msg.chainId]

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

// TODO: this should be invoked on demand when the extension options/popup is active
trackChains(chainsV2, (chainInfo) => {
  enqueueAsyncFn(async () => {
    const tab = tabByChainId[chainInfo.chainId]
    if (!tab) return

    const chains = await environment.get({
      type: "activeChains",
      tabId: tab.id!,
    })
    if (!chains) return

    const index = chains.findIndex(
      ({ chainId }) => chainId === chainInfo.chainId,
    )
    if (index === -1) return

    chains[index] = { ...chains[index], ...chainInfo }
    await environment.set({ type: "activeChains", tabId: tab!.id! }, chains)
  })
})

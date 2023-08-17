import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { MalformedJsonRpcError } from "smoldot"

import { updateDatabases } from "./updateDatabases"
import { enqueueAsyncFn } from "./enqueueAsyncFn"
import { ChainChannel, ChainMultiplex, ClientService } from "./ClientService"
import { trackChains } from "./trackChains"

import * as environment from "../environment"
import { PORTS } from "../shared"

// TODO: merge these maps
const tabByChainId: Record<string, chrome.tabs.Tab> = {}
const activeChains: Record<string, ChainMultiplex> = {}
const activeChannels: Record<string, ChainChannel> = {}

const removeChain = (chainId: string) => {
  const tab = tabByChainId[chainId]
  enqueueAsyncFn(async () => {
    if (!tab) return

    const chains = await environment.get({
      type: "activeChains",
      tabId: tab.id!,
    })
    if (!chains) return

    const pos = chains.findIndex((c) => c.chainId === chainId)
    if (pos === -1) return

    chains.splice(pos, 1)

    await environment.set({ type: "activeChains", tabId: tab!.id! }, chains)
  })
  delete tabByChainId[chainId]

  try {
    activeChannels[chainId]?.remove()
  } catch (error) {
    console.error("error removing chain channel", error)
  }
  delete activeChannels[chainId]

  try {
    activeChains[chainId]?.remove()
  } catch (error) {
    console.error("error removing chain", error)
  }
  delete activeChains[chainId]
}

const resetTab = (tabId: number) => {
  for (const [chainId, tab] of Object.entries(tabByChainId)) {
    if (tab?.id === tabId) removeChain(chainId)
  }
  enqueueAsyncFn(() => environment.remove({ type: "activeChains", tabId }))
}

chrome.tabs.onRemoved.addListener(resetTab)

// TODO: call updateDatabases()
// updateDatabases()

chrome.alarms.create("DatabaseContentAlarm", {
  periodInMinutes: 1440, // 24 hours
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") updateDatabases()
})

const clientService = new ClientService()

const sendMessage = (port: chrome.runtime.Port, message: ToApplication) =>
  port.postMessage(message)

chrome.runtime.onConnect.addListener((port) => {
  if ([PORTS.POPUP, PORTS.OPTIONS].includes(port.name)) {
    const untrackChains = trackChains(port.name, activeChains, (chainInfo) => {
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

    port.onDisconnect.addListener(untrackChains)
  } else if (port.name === PORTS.CONTENT && port.sender?.tab?.id) {
    const tab = port.sender.tab
    const tabId = tab.id!
    resetTab(tabId)

    port.onDisconnect.addListener(() => resetTab(tabId))
    port.onMessage.addListener((msg: ToExtension, port) => {
      switch (msg.type) {
        case "add-chain":
        case "add-well-known-chain": {
          if (tabByChainId[msg.chainId]) {
            port.postMessage({
              origin: "substrate-connect-extension",
              type: "error",
              chainId: msg.chainId,
              errorMessage: "ChainId already in use",
            })
            return
          }

          tabByChainId[msg.chainId] = tab

          const isWellKnown = msg.type === "add-well-known-chain"

          const createChainPromise = isWellKnown
            ? clientService.addWellKnownChain(msg.chainName)
            : clientService.addChain({
                chainSpec: msg.chainSpec,
                potentialRelayChains: msg.potentialRelayChainIds
                  .filter((c) => activeChains[c])
                  .map((c) => activeChains[c].smoldotChain),
              })

          createChainPromise.then(
            (chain) => {
              enqueueAsyncFn(async () => {
                const chains =
                  (await environment.get({
                    type: "activeChains",
                    tabId,
                  })) ?? []

                chains.push({
                  chainId: msg.chainId,
                  isWellKnown,
                  chainName: isWellKnown
                    ? msg.chainName
                    : (JSON.parse(msg.chainSpec).name as string),
                  isSyncing: false,
                  peers: 0,
                  tab: {
                    id: tab.id!,
                    url: tab.url!,
                  },
                })
                await environment.set({ type: "activeChains", tabId }, chains)
              })
              activeChains[msg.chainId] = chain
              activeChannels[msg.chainId] = chain.channel(
                "app",
                (jsonRpcMessage: string) => {
                  sendMessage(port, {
                    origin: "substrate-connect-extension",
                    type: "rpc",
                    chainId: msg.chainId,
                    jsonRpcMessage,
                  })
                },
              )
              sendMessage(port, {
                origin: "substrate-connect-extension",
                type: "chain-ready",
                chainId: msg.chainId,
              })
            },
            (error) => {
              delete tabByChainId[msg.chainId]
              sendMessage(port, {
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
          const chain = activeChannels[msg.chainId]

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
          // If the chainId is invalid, the message is silently discarded, as documented.
          removeChain(msg.chainId)

          return
        }
      }
    })
  } else {
    console.warn("unrecognized port.name", port.name, port.sender?.tab?.url)
  }
})

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

const clientService = new ClientService()

setInterval(() => updateDatabases(clientService), 120_000)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") updateDatabases(clientService)
})

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (
    reason !== chrome.runtime.OnInstalledReason.INSTALL &&
    reason !== chrome.runtime.OnInstalledReason.UPDATE
  )
    return

  chrome.alarms.create("DatabaseContentAlarm", {
    periodInMinutes: 1440, // 24 hours
  })
})

const activeChains: Record<
  string,
  {
    tab: chrome.tabs.Tab
    chain?: ChainMultiplex
    channel?: ChainChannel
  }
> = {}

const removeChain = (chainId: string) => {
  const activeChain = activeChains[chainId]
  if (!activeChain) return
  const { tab, chain, channel } = activeChain
  delete activeChains[chainId]

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

  try {
    channel?.remove()
  } catch (error) {
    console.error("error removing chain channel", error)
  }

  try {
    chain?.remove()
  } catch (error) {
    console.error("error removing chain", error)
  }
}

const resetTab = (tabId: number) => {
  for (const [chainId, { tab }] of Object.entries(activeChains)) {
    if (tab?.id === tabId) removeChain(chainId)
  }
  enqueueAsyncFn(() => environment.remove({ type: "activeChains", tabId }))
}

chrome.tabs.onRemoved.addListener(resetTab)

chrome.alarms.create("DatabaseContentAlarm", {
  periodInMinutes: 1440, // 24 hours
})

const sendMessage = (port: chrome.runtime.Port, message: ToApplication) =>
  port.postMessage(message)

chrome.runtime.onConnect.addListener((port) => {
  if ([PORTS.POPUP, PORTS.OPTIONS].includes(port.name)) {
    const untrackChains = trackChains(
      port.name,
      () =>
        Object.fromEntries(
          Object.entries(activeChains)
            .filter(([_, { chain }]) => !!chain)
            .map(([chainId, { chain }]) => [chainId, chain!] as const),
        ),
      (chainInfo) => {
        enqueueAsyncFn(async () => {
          const tab = activeChains[chainInfo.chainId]?.tab
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
          await environment.set(
            { type: "activeChains", tabId: tab.id! },
            chains,
          )
        })
      },
    )

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
          if (activeChains[msg.chainId]) {
            port.postMessage({
              origin: "substrate-connect-extension",
              type: "error",
              chainId: msg.chainId,
              errorMessage: "ChainId already in use",
            })
            return
          }

          activeChains[msg.chainId] = { tab }

          const isWellKnown = msg.type === "add-well-known-chain"

          const createChainPromise = isWellKnown
            ? clientService.addWellKnownChain(msg.chainName)
            : clientService.addChain({
                chainSpec: msg.chainSpec,
                potentialRelayChains: msg.potentialRelayChainIds
                  .filter((c) => !!activeChains[c]?.chain)
                  .map((c) => activeChains[c]?.chain!.smoldotChain),
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
              activeChains[msg.chainId].chain = chain
              activeChains[msg.chainId].channel = chain.channel(
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
              removeChain(msg.chainId)
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
          const { channel } = activeChains[msg.chainId]

          // If the chainId is invalid, the message is silently discarded, as documented.
          if (!channel) return

          try {
            channel.sendJsonRpc(msg.jsonRpcMessage)
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

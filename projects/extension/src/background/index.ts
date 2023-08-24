import { MalformedJsonRpcError } from "smoldot"
import { createScClient } from "@substrate/connect"

import { updateDatabases } from "./updateDatabases"
import { enqueueAsyncFn } from "./enqueueAsyncFn"
import { ChainChannel, ChainMultiplex, createClient } from "./createClient"
import { trackChains } from "./trackChains"

import * as environment from "../environment"
import { PORTS } from "../shared"
import type { ToBackground, ToContent } from "../protocol"

enqueueAsyncFn(() => environment.clearAllActiveChains())

const scClient = createScClient({ embeddedNodeConfig: { maxLogLevel: 3 } })

setInterval(() => updateDatabases(scClient), 120_000)

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") updateDatabases(scClient)
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

  const { tab, channel } = activeChain
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

const client = createClient()

const postMessage = (port: chrome.runtime.Port, message: ToContent) =>
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

    port.onMessage.addListener(async (msg: ToBackground, port) => {
      switch (msg.type) {
        case "keep-alive": {
          postMessage(port, { type: "keep-alive-ack" })
          return
        }

        case "add-chain":
        case "add-well-known-chain": {
          if (activeChains[msg.chainId]) {
            postMessage(port, {
              origin: "substrate-connect-extension",
              type: "error",
              chainId: msg.chainId,
              errorMessage: "Requested chainId already in use",
            })
            return
          }

          activeChains[msg.chainId] = { tab }

          const isWellKnown = msg.type === "add-well-known-chain"

          try {
            const chain = isWellKnown
              ? await client.addWellKnownChain(msg.chainName)
              : await client.addChain({
                  chainSpec: msg.chainSpec,
                  potentialRelayChains: await Promise.all(
                    msg.potentialRelayChainIds
                      .filter((c) => !!activeChains[c]?.chain)
                      .map((c) => activeChains[c]?.chain!),
                  ),
                })

            // As documented in the protocol, if a "remove-chain" message was received before
            // a "chain-ready" message was sent back, the chain can be discarded
            if (!activeChains[msg.chainId]) {
              chain.channel("any", () => {}).remove()
              return
            }

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
                postMessage(port, {
                  origin: "substrate-connect-extension",
                  type: "rpc",
                  chainId: msg.chainId,
                  jsonRpcMessage,
                })
              },
            )
            postMessage(port, {
              origin: "substrate-connect-extension",
              type: "chain-ready",
              chainId: msg.chainId,
            })
          } catch (error) {
            removeChain(msg.chainId)
            postMessage(port, {
              origin: "substrate-connect-extension",
              type: "error",
              chainId: msg.chainId,
              errorMessage:
                error instanceof Error
                  ? error.toString()
                  : "Unknown error when adding chain",
            })
          }

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
              removeChain(msg.chainId)
              postMessage(port, {
                origin: "substrate-connect-extension",
                type: "error",
                chainId: msg.chainId,
                errorMessage:
                  error instanceof Error
                    ? error.toString()
                    : "Unknown error when sending RPC message",
              })
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

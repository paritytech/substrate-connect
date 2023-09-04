import { AlreadyDestroyedError } from "@substrate/connect"
import { compact } from "scale-ts"
import { fromHex } from "@unstoppablejs/utils"

import { ChainMultiplex } from "./createClient"

export interface ChainInfo {
  isSyncing: boolean
  peers: number
  // Height of the current best block of the chain, or undefined if not known yet or if the
  // height couldn't be defined.
  bestBlockHeight?: number
}

const sendJsonRpc = (
  chain: { sendJsonRpc(rpc: string): void },
  message: { id: string; method: string; params: any[] },
) => {
  chain.sendJsonRpc(JSON.stringify({ jsonrpc: "2.0", ...message }))
}

const trackChain = (
  channelId: string,
  chain: ChainMultiplex,
  onUpdate: (chainInfo: ChainInfo) => void,
) => {
  let nextRpcRqId = 0
  // Blocks get unpinned when they become ancestor of the current finalized block. In other words,
  // the current finalized block and all its descendants are kept pinned. This is necessary in
  // order to be able to query the header of the best block, as the best block can be the
  // current finalized block or any of its descendants.
  let readySubscriptionId: string | undefined
  // If defined, contains the id of the RPC request whose response contains the header of the
  // best block of the chain.
  let bestBlockHeaderRequestId: string | undefined
  // Hash of the current finalized block of the chain in hexadecimal, or undefined if not known
  // yet.
  let finalizedBlockHashHex: string | undefined

  const chainInfo: ChainInfo = {
    isSyncing: true,
    peers: 0,
  }
  const channel = chain.channel(channelId, (rawMessage) => {
    const message = JSON.parse(rawMessage)
    if (!message.id) {
      if (
        message.method === "chainHead_unstable_followEvent" &&
        message.params.subscription === readySubscriptionId
      ) {
        // We've received a notification on our `chainHead_unstable_followEvent`
        // subscription.
        switch (message.params.result.event) {
          case "initialized": {
            // The chain is now in sync and has downloaded the runtime.
            chainInfo.isSyncing = false
            onUpdate(chainInfo)
            finalizedBlockHashHex = message.params.result.finalizedBlockHash

            // Immediately send a single health request to the chain.
            sendJsonRpc(channel, {
              id: "health-check:" + nextRpcRqId++,
              method: "system_health",
              params: [],
            })

            // Also immediately request the header of the finalized block.
            bestBlockHeaderRequestId = "best-block-header:" + nextRpcRqId++
            sendJsonRpc(channel, {
              id: bestBlockHeaderRequestId,
              method: "chainHead_unstable_header",
              params: [readySubscriptionId, finalizedBlockHashHex],
            })

            return
          }
          case "stop": {
            // Our subscription has been force-killed by the client. This is normal and can
            // happen for example if the client is overloaded. Restart the subscription.
            readySubscriptionId = undefined
            bestBlockHeaderRequestId = undefined
            finalizedBlockHashHex = undefined
            chainInfo.bestBlockHeight = undefined
            chainInfo.isSyncing = true
            onUpdate(chainInfo)

            sendJsonRpc(channel, {
              id: "ready-sub:" + nextRpcRqId++,
              method: "chainHead_unstable_follow",
              params: [false],
            })

            return
          }
          case "bestBlockChanged": {
            // The best block has changed. Request the header of this new best block in
            // order to know its height.
            bestBlockHeaderRequestId = "best-block-header:" + nextRpcRqId++
            sendJsonRpc(channel, {
              id: bestBlockHeaderRequestId,
              method: "chainHead_unstable_header",
              params: [
                readySubscriptionId,
                message.params.result.bestBlockHash,
              ],
            })

            return
          }
          case "finalized": {
            // When one or more new blocks get finalized, we unpin all blocks except for
            // the new current finalized.
            let finalized = message.params.result.finalizedBlockHashes as [
              string,
            ]
            let pruned = message.params.result.prunedBlockHashes as [string]
            let newCurrentFinalized = finalized.pop()
            ;[finalizedBlockHashHex, ...pruned, ...finalized].forEach(
              (blockHash) => {
                // `finalizedBlockHashHex` can be undefined
                if (blockHash === undefined) return
                sendJsonRpc(channel, {
                  id: "block-unpin:" + nextRpcRqId++,
                  method: "chainHead_unstable_unpin",
                  params: [readySubscriptionId, blockHash],
                })
              },
            )
            finalizedBlockHashHex = newCurrentFinalized
            return
          }
        }
      }
      return
    }
    const id = message.id as string

    if (id.startsWith("health-check:")) {
      // Store the health status in the locally-held information.
      chainInfo.peers = (message.result as { peers: number }).peers
      onUpdate(chainInfo)
    } else if (id.startsWith("ready-sub:")) {
      readySubscriptionId = message.result as string
    } else if (id.startsWith("best-block-header:")) {
      // We might receive responses to header requests concerning blocks that were but are
      // no longer the best block of the chain. Ignore these responses.
      if (id === bestBlockHeaderRequestId) {
        bestBlockHeaderRequestId = undefined
        // The RPC call might return `null` if the subscription is dead.
        if (message.result) {
          try {
            chainInfo.bestBlockHeight = compact.dec(
              fromHex(message.result).slice(32),
            ) as number
          } catch (error) {
            chainInfo.bestBlockHeight = undefined
          }
          onUpdate(chainInfo)
        }
      }
    } else if (id.startsWith("block-unpin:")) {
      return
    } else {
      // Never supposed to happen. Indicates a bug somewhere.
      console.assert(false)
    }
  })

  const healthCheckInterval = setInterval(
    () =>
      sendJsonRpc(channel, {
        id: "health-check:" + nextRpcRqId++,
        method: "system_health",
        params: [],
      }),
    3_000,
  )

  onUpdate(chainInfo)

  sendJsonRpc(channel, {
    id: "ready-sub:" + nextRpcRqId++,
    method: "chainHead_unstable_follow",
    params: [false],
  })

  return () => {
    clearInterval(healthCheckInterval)
    channel.remove()
    if (readySubscriptionId) {
      try {
        sendJsonRpc(channel, {
          id: "ready-sub:" + nextRpcRqId++,
          method: "chainHead_unstable_unfollow",
          params: [readySubscriptionId],
        })
      } catch (error) {
        if (!(error instanceof AlreadyDestroyedError)) {
          console.error(error)
        }
      }
    }
  }
}

export const trackChains = (
  channelId: string,
  getActiveChains: () => Record<string, ChainMultiplex>,
  onUpdate: (chainInfo: ChainInfo & { chainId: string }) => void,
) => {
  const subscriptions: Record<string, () => void> = {}

  const monitorChainsInterval = setInterval(() => {
    // TODO: dedupe similar chains
    const chains = getActiveChains()
    for (const [chainId, chain] of Object.entries(chains)) {
      // @ts-ignore
      if (subscriptions[chainId]) continue
      subscriptions[chainId] = trackChain(channelId, chain, (chainInfo) =>
        onUpdate({ ...chainInfo, chainId }),
      )
    }

    const activeChainIds = Object.keys(chains)
    for (const chainId of Object.keys(subscriptions)) {
      if (activeChainIds.includes(chainId)) continue
      const unsubscribe = subscriptions[chainId]
      delete subscriptions[chainId]
      unsubscribe()
    }
  }, 5_000)

  return () => {
    clearInterval(monitorChainsInterval)
    for (const chainId of Object.keys(subscriptions)) {
      const unsubscribe = subscriptions[chainId]
      delete subscriptions[chainId]
      unsubscribe()
    }
  }
}

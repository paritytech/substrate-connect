import { ChainMultiplex } from "./ClientService"

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
  const channel = chain.channel("track", (rawMessage) => {
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
            chainInfo.bestBlockHeight = headerToHeight(message.result)
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

  sendJsonRpc(channel, {
    id: "ready-sub:" + nextRpcRqId++,
    method: "chainHead_unstable_follow",
    params: [false],
  })

  return () => {
    clearInterval(healthCheckInterval)
    if (readySubscriptionId) {
      try {
        sendJsonRpc(channel, {
          id: "ready-sub:" + nextRpcRqId++,
          method: "chainHead_unstable_unfollow",
          params: [readySubscriptionId],
        })
      } catch (_) {
        // TODO: log non-AlreadyDestroyedError
      }
    }
    channel.remove()
  }
}

export const trackChains = (
  chains: Record<string, ChainMultiplex>,
  onUpdate: (chainInfo: ChainInfo & { chainId: string }) => void,
) => {
  const subscriptions: Record<string, () => void> = {}

  const monitorChainsInterval = setInterval(() => {
    // TODO: dedupe similar chains
    for (const [chainId, chain] of Object.entries(chains)) {
      if (subscriptions[chainId]) continue
      subscriptions[chainId] = trackChain(chain, (chainInfo) =>
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
    Object.values(subscriptions).forEach((unsubscribe) => unsubscribe)
  }
}

// Converts a block header, as a hexadecimal string, to a block height.
//
// This function should give the accurate block height in most situations, but it is possible that
// the value is erroneous.
//
// This function assumes that the block header is a block header generated using Substrate. This
// is not necessarily always true. When that happens, an error is thrown.
//
// Additionally, this function assumes that the block height is 32bits, which is the case for the
// vast majority of the chains. There is currently no way to know the size of the block height.
// This is a huge flaw in Substrate that we can't do much about here. Fortuntely, since the block
// height is implemented in compact SCALE encoding, as long as the field containing the number is
// at least 32 bits and the value is less than 2^32, it will encode the same regardless.
function headerToHeight(hexHeader: String): number {
  // Remove the initial prefix.
  if (!(hexHeader.startsWith("0x") || hexHeader.startsWith("0X")))
    throw new Error("Not a hexadecimal number")
  hexHeader = hexHeader.slice(2)

  // The header should start with 32 bytes containing the parent hash.
  if (hexHeader.length < 64) throw new Error("Too short")
  hexHeader = hexHeader.slice(64)

  // The next field is the block number (which is what interests us) encoded in SCALE compact.
  // Unfortunately this format is a bit complicated to decode.
  // See https://docs.substrate.io/v3/advanced/scale-codec/#compactgeneral-integers
  if (hexHeader.length < 2) throw new Error("Too short")
  const b0 = parseInt(hexHeader.slice(0, 2), 16)

  switch ((b0 & 3) as 0 | 1 | 2 | 3) {
    case 0: {
      return b0 >> 2
    }
    case 1: {
      if (hexHeader.length < 4) throw new Error("Too short")
      const b1 = parseInt(hexHeader.slice(2, 4), 16)
      return (b0 >> 2) + b1 * 2 ** 6
    }
    case 2: {
      if (hexHeader.length < 8) throw new Error("Too short")
      const b1 = parseInt(hexHeader.slice(2, 4), 16)
      const b2 = parseInt(hexHeader.slice(4, 6), 16)
      const b3 = parseInt(hexHeader.slice(6, 8), 16)
      return (b0 >> 2) + b1 * 2 ** 6 + b2 * 2 ** 14 + b3 * 2 ** 22
    }
    case 3: {
      hexHeader = hexHeader.slice(2)
      let len = (4 + b0) >> 2
      let output = 0
      let base = 0
      while (len--) {
        if (hexHeader.length < 2) throw new Error("Too short")
        // Note that we assume that value can't overflow. This function is a helper and not.
        output += parseInt(hexHeader.slice(0, 2)) << base
        hexHeader = hexHeader.slice(2)
        base += 8
      }
      return output
    }
  }
}

import {
  Chain,
  createScClient,
  ScClient,
  WellKnownChain,
  JsonRpcCallback,
} from "@substrate/connect"
import { createClient } from "@polkadot-api/substrate-client"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"

const wellKnownChains: ReadonlySet<string> = new Set<WellKnownChain>(
  Object.values(WellKnownChain),
)

const isWellKnownChain = (input: string): input is WellKnownChain =>
  wellKnownChains.has(input)

let client: ScClient
const noop = () => {}
const ScProvider = (input: string, relayChainSpec?: string) => {
  client ??= createScClient()
  const addChain = (input: string, jsonRpcCallback?: JsonRpcCallback) =>
    isWellKnownChain(input)
      ? client.addWellKnownChain(input, jsonRpcCallback)
      : client.addChain(input, jsonRpcCallback)

  return getSyncProvider(async () => {
    let listener: (message: string) => void = noop
    const onMessage = (msg: string) => {
      listener(msg)
    }

    let chain: Chain
    try {
      const relayChain = relayChainSpec
        ? await addChain(relayChainSpec)
        : undefined
      chain = relayChain
        ? await relayChain.addChain(input, onMessage)
        : await addChain(input, onMessage)
    } catch (e) {
      console.warn(
        `couldn't create chain with: ${input} ${relayChainSpec ?? ""}`,
      )
      console.error(e)
      throw e
    }

    return (onMessage) => {
      listener = onMessage
      return {
        send(msg: string) {
          chain.sendJsonRpc(msg)
        },
        disconnect() {
          listener = noop
          chain.remove()
        },
      }
    }
  })
}

export async function connect(
  _nodeName: string,
  networkInfo: any,
  parachainId?: string,
) {
  const customChainSpec = require(networkInfo.chainSpecPath)
  let provider
  if (parachainId) {
    const customParachainSpec = require(
      networkInfo?.paras[parachainId]?.chainSpecPath,
    )
    provider = ScProvider(
      JSON.stringify(customParachainSpec),
      JSON.stringify(customChainSpec),
    )
  } else {
    provider = ScProvider(JSON.stringify(customChainSpec))
  }

  return createClient(provider)
}

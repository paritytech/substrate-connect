import {
  Chain,
  createScClient,
  ScClient,
  WellKnownChain,
} from "@substrate/connect"
import { createClient } from "@polkadot-api/substrate-client"
import type { GetProvider } from "@polkadot-api/json-rpc-provider"

const wellKnownChains: ReadonlySet<string> = new Set<WellKnownChain>(
  Object.values(WellKnownChain),
)

const isWellKnownChain = (input: string): input is WellKnownChain =>
  wellKnownChains.has(input)

let client: ScClient
const ScProvider = (input: string, relayChainSpec?: string): GetProvider => {
  client ??= createScClient()

  return (onMessage, onStatus) => {
    const addChain = (input: string) => {
      return isWellKnownChain(input)
        ? client.addWellKnownChain(input, onMessage)
        : relayChain
        ? relayChain.addChain(input, onMessage)
        : client.addChain(input, onMessage)
    }

    let chain: Chain | undefined
    let relayChain: Chain | undefined
    const open = () => {
      ;(async () => {
        if (relayChainSpec) {
          relayChain = await addChain(relayChainSpec)
        }

        chain = await addChain(input)

        onStatus("connected")
      })()
    }

    const close = () => {
      chain?.remove()
      relayChain?.remove()
    }

    const send = (msg: string) => {
      chain?.sendJsonRpc(msg)
    }

    return { open, close, send }
  }
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

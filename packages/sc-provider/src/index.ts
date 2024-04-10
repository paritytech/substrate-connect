import type {
  JsonRpcProvider,
  JsonRpcConnection,
} from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import type { WellKnownChain, Chain, ScClient } from "@substrate/connect"

export type { JsonRpcProvider, JsonRpcConnection }

const wellKnownChains = new Set([
  "polkadot",
  "ksmcc3",
  "rococo_v2_2",
  "westend2",
])
const noop = () => {}
type AddChain = (input: WellKnownChain | string) => {
  relayChain: JsonRpcProvider
  addParachain: (input: string) => JsonRpcProvider
}

const getProvider = (
  getAddChain: (onMessage: (msg: string) => void) => Promise<Chain>,
  input: string,
) =>
  getSyncProvider(async () => {
    let listener: (message: string) => void = noop
    const onMessage = (msg: string) => {
      listener(msg)
    }
    let chain: Chain
    try {
      chain = await getAddChain(onMessage)
    } catch (e) {
      console.warn(`couldn't create chain with: ${input}`)
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
          chain?.remove()
        },
      }
    }
  })

export const getScProvider = (client: ScClient): AddChain => {
  return (input: WellKnownChain | string) => {
    const getRelayChain = (onMessage?: (data: string) => void) =>
      wellKnownChains.has(input as any)
        ? client.addWellKnownChain(input as WellKnownChain, onMessage)
        : client.addChain(input, onMessage)

    const relayChain = getProvider(getRelayChain, input)

    const addParachain = (input: string) =>
      getProvider(async (onMessage) => {
        const relayChain = await getRelayChain()
        const chain = await relayChain.addChain(input, onMessage)
        const originalRemove = chain.remove.bind(chain)
        chain.remove = () => {
          originalRemove()
          relayChain.remove
        }
        return chain
      }, input)

    return { relayChain, addParachain }
  }
}

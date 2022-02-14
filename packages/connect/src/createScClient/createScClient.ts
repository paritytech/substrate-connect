import type { ProviderInterface } from "@polkadot/rpc-provider/types"
import type { JsonRpcCallback } from "../connector/types.js"
import { WellKnownChains } from "../WellKnownChains.js"
import { getConnectorClient } from "../connector/index.js"
import { ScProvider } from "./ScProvider/index.js"

export interface ScClient {
  addWellKnownChain: (
    wellKnownChain: WellKnownChains,
  ) => Promise<ProviderInterface>
  addChain: (chainSpec: string) => Promise<ProviderInterface>
}

export const createScClient = (): ScClient => {
  const client = getConnectorClient()

  return {
    addChain: async (chainSpec: string) => {
      const provider = new ScProvider((callback: JsonRpcCallback) =>
        client.addChain(chainSpec, callback),
      )
      await provider.connect()
      return provider
    },
    addWellKnownChain: async (wellKnownChain: WellKnownChains) => {
      const provider = new ScProvider((callback: JsonRpcCallback) =>
        client.addWellKnownChain(wellKnownChain, callback),
      )
      await provider.connect()
      return provider
    },
  }
}

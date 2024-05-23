import { createClient } from "@polkadot-api/substrate-client"
import { getObservableClient as getObservableClient_ } from "@polkadot-api/observable-client"
import * as SubstrateDiscovery from "@substrate/discovery"

export const getObservableClient = (
  api: NonNullable<SubstrateDiscovery.ChainsProvider["v1"]>,
  chainId: string,
) => {
  const chain = api.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return getObservableClient_(createClient(chain.connect))
}

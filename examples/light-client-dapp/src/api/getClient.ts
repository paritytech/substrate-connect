import { createClient as createClient_ } from "polkadot-api"
import * as SubstrateDiscovery from "@substrate/discovery"

export const getClient = (
  api: NonNullable<SubstrateDiscovery.ChainsProvider["v1"]>,
  chainId: string,
) => {
  const chain = api.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return createClient_(chain.connect)
}

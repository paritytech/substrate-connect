import { createClient as createClient_ } from "polkadot-api"
import * as SubstrateDiscovery from "@substrate/discovery"

export const getClient = (
  provider: SubstrateDiscovery.WalletProvider,
  chainId: string,
) => {
  const chain = provider.chains?.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return createClient_(chain.connect)
}

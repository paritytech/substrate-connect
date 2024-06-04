import { createClient } from "@polkadot-api/substrate-client"
import { getObservableClient as getObservableClient_ } from "@polkadot-api/observable-client"
import { Unstable } from "@substrate/connect-discovery"

export const getObservableClient = (
  provider: Unstable.Provider,
  chainId: string,
) => {
  const chain = provider.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return getObservableClient_(createClient(chain.connect))
}

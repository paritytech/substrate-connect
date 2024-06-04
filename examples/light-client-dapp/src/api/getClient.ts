import { createClient as createClient_ } from "polkadot-api"
import { Unstable } from "@substrate/connect-discovery"

export const getClient = (provider: Unstable.Provider, chainId: string) => {
  const chain = provider.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return createClient_(chain.connect)
}

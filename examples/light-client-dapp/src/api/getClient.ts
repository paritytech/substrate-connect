import { createClient as createClient_ } from "polkadot-api"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"

export const getClient = (
  provider: UnstableWallet.Provider,
  chainId: string,
) => {
  const chain = provider.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return createClient_(chain.connect)
}

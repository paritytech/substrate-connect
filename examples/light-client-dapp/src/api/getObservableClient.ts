import { createClient as createClient_ } from "@polkadot-api/substrate-client"
import { getObservableClient as getObservableClient_ } from "@polkadot-api/observable-client"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"

export const getObservableClient = (
  provider: UnstableWallet.Provider,
  chainId: string,
) => {
  const chain = provider.getChains()[chainId]
  if (!chain) throw new Error("unknown chain")
  return getObservableClient_(createClient_(chain.connect))
}

import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"

type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

export type Account = {
  readonly address: string
}

// The key is the genesis hash
export type Chains = Record<string, Chain>

export type Chain = {
  genesisHash: string
  name: string
  connect: JsonRpcProvider
}

export type V1WalletProvider = {
  chains?: {
    addChain: (
      chainSpec: string,
      relayChainGenesisHash?: string,
    ) => Promise<Chain>
    getChains: () => Chains
    addChainsChangeListener: (listener: Callback<Chains>) => UnsubscribeFn
  }
  accounts?: {
    getAccounts: (chainId: string) => Promise<Account[]>
  }
}

export type UnstableWalletProvider = {
  chains?: {
    addChain: (
      chainSpec: string,
      relayChainGenesisHash?: string,
    ) => Promise<Chain>
    getChains: () => Chains
    addChainsChangeListener: (listener: Callback<Chains>) => UnsubscribeFn
  }
  accounts?: {
    getAccounts: (chainId: string) => Promise<Account[]>
  }

  extrinsics?: {
    createTx: (
      chainId: string,
      from: string,
      // TODO: it should encode a Tuple<CallData, Extra, AdditionalSigned>
      callData: string,
    ) => Promise<string>
  }
}

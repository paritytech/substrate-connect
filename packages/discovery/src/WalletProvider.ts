import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"
import { ReadonlyDeep } from "type-fest"

type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

export type Account = {
  readonly address: string
}

// The key is the genesis hash
export type Chains = Readonly<Record<string, Chain>>

export type Chain = Readonly<{
  genesisHash: string
  name: string
  connect: JsonRpcProvider
}>

export type V1WalletProvider = ReadonlyDeep<{
  _tag: "V1WalletProvider"
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
}>

export type UnstableWalletProvider = ReadonlyDeep<{
  _tag: "UnstableWalletProvider"
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
}>

export type WalletProvider = V1WalletProvider | UnstableWalletProvider

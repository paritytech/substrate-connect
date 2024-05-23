import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"

type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

export type Account = {
  readonly address: string
}

/**
 * Mapping of Genesis Hash to Chain
 */
export type Chains = Record<string, Chain>

export type Chain = {
  genesisHash: string
  name: string
  connect: JsonRpcProvider
}

export type V1ChainsAPI = {
  addChain: (
    chainSpec: string,
    relayChainGenesisHash?: string,
  ) => Promise<Chain>
  getChains: () => Chains
  addChainsChangeListener: (listener: Callback<Chains>) => UnsubscribeFn
}

export type UnstableChainsAPI = {
  addChain: (
    chainSpec: string,
    relayChainGenesisHash?: string,
  ) => Promise<Chain>
  getChains: () => Chains
  addChainsChangeListener: (listener: Callback<Chains>) => UnsubscribeFn
}

export type V1AccountsAPI = {
  getAccounts: (chainId: string) => Promise<Account[]>
}

export type UnstableAccountsAPI = {
  getAccounts: (chainId: string) => Promise<Account[]>
}

export type UnstableExtrinsicsAPI = {
  createTx: (
    chainId: string,
    from: string,
    // TODO: it should encode a Tuple<CallData, Extra, AdditionalSigned>
    callData: string,
  ) => Promise<string>
}

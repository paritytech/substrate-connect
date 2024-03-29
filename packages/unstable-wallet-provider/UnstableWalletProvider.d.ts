export namespace UnstableWallet {
  type Callback<T> = (value: T) => void
  type UnsubscribeFn = () => void

  export interface Provider {
    // Allows dApp developers to request the provider to register their chain
    getChain: (
      chainSpec: string,
      relayChainGenesisHash?: string,
    ) => Promise<RawChain>

    // Retrieves the current list of available Chains
    getChains: () => RawChains

    // Registers a callback invoked when the list of available chains changes
    addChainsChangeListener: (listener: Callback<RawChains>) => UnsubscribeFn

    // TODO: move inside RawChains and remove chainId
    getAccounts: (chainId: string) => Promise<Account[]>

    // TODO: move inside RawChains and remove chainId
    createTx: (
      chainId: string,
      from: string,
      // TODO: it should encode a Tuple<CallData, Extra, AdditionalSigned>
      callData: string,
    ) => Promise<string>
  }

  type Account = {
    address: string
  }

  // The key is the genesis hash
  type RawChains = Record<string, RawChain>

  export interface RawChain {
    genesisHash: string

    name: string

    connect: (
      // the listener callback that the JsonRpcProvider will be sending messages to.
      onMessage: Callback<string>,
    ) => JsonRpcProvider
  }

  export interface JsonRpcProvider {
    // it sends messages to the JSON RPC Server
    send: Callback<string>

    // it disconnects from the JSON RPC Server and it de-registers
    // the `onMessage` and `onStatusChange` callbacks that was previously registered
    disconnect: UnsubscribeFn
  }
}

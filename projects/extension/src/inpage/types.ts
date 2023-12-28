type Callback<T> = (value: T) => void
type UnsubscribeFn = () => void

export interface PolkadotProvider {
  // Allows dApp developers to request the provider to register their chain
  getChain: (
    chainspec: string,
    relayChainGenesisHash?: string,
  ) => Promise<Chain>

  // Retrieves the current list of available Chains
  getChains: () => Promise<Chains>

  // Registers a callback invoked when the list of available chains changes
  onChainsChange: (chains: Callback<Chains>) => UnsubscribeFn
}

// The key is the genesis hash
type Chains = Record<string, Chain>

export interface Chain {
  genesisHash: string
  name: string

  // it pulls the current list of available accounts for this Chain
  getAccounts: () => Promise<Accounts>

  // registers a callback that will be invoked whenever the list of available
  // accounts for this chain has changed
  onAccountsChange: (accounts: Callback<Accounts>) => UnsubscribeFn

  connect: (
    // the listener callback that the JsonRpcProvider will be sending messages to.
    onMessage: Callback<string>,
  ) => Promise<ChainProvider>
}

export interface ChainProvider {
  // `from`: SS58Formated public key
  // `callData` is the scale encoded call-data (module index, call index and args)
  createTx: (from: string, callData: string) => Promise<string>

  // contains a JSON RPC Provider that it's compliant with new
  // JSON-RPC API spec: https://paritytech.github.io/json-rpc-interface-spec/api.html
  provider: JsonRpcProvider
}

type Accounts = Array<Account>

interface Account {
  publicKey: Uint8Array
  ss58PublicKey: string
  ss58Address: string

  // The provider may have captured a display name when creating the account.
  displayName?: string
}

interface JsonRpcProvider {
  // it sends messages to the JSON RPC Server
  send: Callback<string>

  // it disconnects from the JSON RPC Server and it de-registers
  // the `onMessage` and `onStatusChange` callbacks that was previously registered
  disconnect: UnsubscribeFn
}

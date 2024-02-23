// FIXME: use correct type from PolkadotProvider
export type Account = {
  address: string
}

// FIXME: use correct type from PolkadotProvider
export type UnstableProvider = {
  getAccounts: () => Promise<Account[]>
}

// FIXME: use correct type from PolkadotProvider
export type UnstableOnProvider = {}

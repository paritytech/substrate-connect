import type {
  UserSignedExtensions,
  UserSignedExtensionName,
} from "@polkadot-api/tx-helper"

export type Account = {
  address: string
}

type DerivationPath = {
  chainId: string
  path: string
  publicKey: string
}

export type Keyset = {
  scheme: string
  derivationPaths: DerivationPath[]
  createdAt: number
}

export type SignRequest = {
  url: string
  chainId: string
  address: string
  callData: string
  userSignedExtensionNames: UserSignedExtensionName[]
}

type KeyringState = {
  isLocked: boolean
  hasPassword: boolean
}

export type BackgroundRpcSpec = {
  getAccounts(chainId: string): Promise<Account[]>
  createTx(chainId: string, from: string, callData: string): Promise<string>
  // private methods
  getSignRequests(): Promise<Record<string, SignRequest>>
  approveSignRequest(
    id: string,
    userSignedExtensions: Partial<UserSignedExtensions>,
  ): Promise<void>
  cancelSignRequest(id: string): Promise<void>
  lockKeyring(): Promise<void>
  unlockKeyring(password: string): Promise<void>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
  createPassword(password: string): Promise<void>
  insertKeyset(keysetName: string, keyset: Keyset): Promise<void>
  getKeyset(keysetName: string): Promise<Keyset | undefined>
  listKeysets(): Promise<Record<string, Keyset>>
  removeKeyset(keysetName: string): Promise<void>
  clearKeysets(): Promise<void>
  getKeyringState(): Promise<KeyringState>
  getPrimaryKeysetName(): Promise<string | undefined>
  setPrimaryKeysetName(keysetName: string): Promise<void>
}

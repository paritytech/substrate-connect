import type {
  UserSignedExtensions,
  UserSignedExtensionName,
} from "@polkadot-api/tx-helper"

export type Account = {
  address: string
}

export type KeysetAccount =
  | ({ _type: "DerivationPath" } & DerivationPath)
  | { _type: "SignOnly"; publicKey: string }
  | { _type: "ViewOnly"; publicKey: string }

export type DerivationPath = {
  chainId: string
  path: string
  publicKey: string
}

export type Keyset = {
  name: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  accounts: KeysetAccount[]
  createdAt: number
}

export type SignRequest = {
  url: string
  chainId: string
  address: string
  callData: string
  userSignedExtensionNames: UserSignedExtensionName[]
}

export type InsertKeysetArgs = {
  name: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  createdAt: number
  miniSecret: string
  derivationPaths?: DerivationPath[]
  importedPrivateKeys?: string[]
  importedPublicKeys?: string[]
}

export type ImportPrivateKeyArgs = {
  keysetName: string
  privatekey: string
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
  getKeysets(): Promise<Keyset[]>
  insertKeyset(keyset: InsertKeysetArgs): Promise<void>
  updateKeyset(keyset: Keyset): Promise<void>
  getKeyset(keysetName: string): Promise<Keyset | undefined>
  removeKeyset(keysetName: string): Promise<void>
  clearKeysets(): Promise<void>
  importPrivateKey(args: ImportPrivateKeyArgs): Promise<void>
  getKeyringState(): Promise<KeyringState>
}

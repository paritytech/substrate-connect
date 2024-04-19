import type { Injected } from "@polkadot/extension-inject/types"
import {
  UserSignedExtensionName,
  UserSignedExtensions,
} from "../types/UserSignedExtension"

/**
 * 1:1 representation of chain spec JSON format with addition fields
 */
export type ChainSpec = {
  name: string
  id: string
  relay_chain?: string
  isWellKnown: boolean
  raw: string
}

export type Account = {
  address: string
}

export type KeystoreAccount =
  | ({ type: "Keyset" } & DerivationPath)
  | { type: "Keypair"; publicKey: string }

export type DerivationPath = {
  chainId: string
  path: string
  publicKey: string
}

export type CryptoKey = {
  name: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  accounts: KeystoreAccount[]
  createdAt: number
}

export type SignRequest = {
  url: string
  chainId: string
  address: string
  callData: string
  userSignedExtensions:
    | { type: "names"; names: UserSignedExtensionName[] }
    | { type: "values"; values: Partial<UserSignedExtensions> }
}

export type InsertCryptoKeyArgs = {
  name: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  createdAt: number
} & (
  | {
      type: "Keyset"
      miniSecret: string
      derivationPaths: DerivationPath[]
    }
  | {
      type: "Keypair"
      privatekey: string
    }
)

type KeyringState = {
  isLocked: boolean
  hasPassword: boolean
}

export namespace Pjs {
  export type SignerPayloadJSON = Parameters<
    Exclude<Injected["signer"]["signPayload"], undefined>
  >[0]
  export type SignerPayloadRaw = Parameters<
    Exclude<Injected["signer"]["signRaw"], undefined>
  >[0]
}

export type BackgroundRpcSpec = {
  getAccounts(chainId: string): Promise<Account[]>
  createTx(chainId: string, from: string, callData: string): Promise<string>
  pjsSignPayload(payload: Pjs.SignerPayloadJSON): Promise<string>
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
  getCryptoKeys(): Promise<CryptoKey[]>
  insertCryptoKey(args: InsertCryptoKeyArgs): Promise<void>
  // TODO: implement updateCryptographicKey
  updateCryptoKey(args: never): Promise<void>
  getCryptoKey(name: string): Promise<CryptoKey | undefined>
  removeCryptoKey(name: string): Promise<void>
  clearCryptoKeys(): Promise<void>
  getKeyringState(): Promise<KeyringState>

  getChainSpecs(): Promise<ChainSpec[]>
  addChainSpec(chainSpec: string): Promise<void>
}

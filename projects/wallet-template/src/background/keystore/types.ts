import { KeystoreV4 } from "./keystoreV4"

export type DerivationPath = {
  chainId: string
  path: string
  publicKey: string
}

export type BaseKeystore = {
  name: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  createdAt: number
}

export type KeysetKeystore = BaseKeystore & {
  type: "KeysetKeystore"
  derivationPaths: DerivationPath[]
}

export type KeypairKeystore = BaseKeystore & {
  type: "KeypairKeyStore"
  publicKey: string
}

export type KeystoreMeta = KeysetKeystore | KeypairKeystore

export type KeystoreV4WithMeta = KeystoreV4 & {
  meta: KeystoreMeta[]
}

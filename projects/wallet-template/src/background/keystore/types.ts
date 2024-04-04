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

export type DerivationPathKeystore = BaseKeystore & {
  _type: "DerivationPathKeystore"
  derivationPaths: DerivationPath[]
}

export type PrivateKeyKeystore = BaseKeystore & {
  _type: "PrivateKeyKeystore"
  privateKey: string
}

export type KeystoreMeta = DerivationPathKeystore | PrivateKeyKeystore

export type KeystoreV4WithMeta = KeystoreV4 & {
  meta: KeystoreMeta[]
}

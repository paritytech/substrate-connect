import { KeystoreV4 } from "./keystoreV4"

export type DerivationPath = {
  chainId: string
  path: string
  publicKey: string
}

export type KeystoreMeta = {
  name: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  derivationPaths: DerivationPath[]
  importedPrivateKeys: string[]
  importedPublicKeys: string[]
  createdAt: number
}

export type KeystoreV4WithMeta = KeystoreV4 & {
  meta: KeystoreMeta[]
}

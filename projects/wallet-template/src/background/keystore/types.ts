import { Keyset } from "../types"
import { KeystoreV4 } from "./keystoreV4"

type KeystoreMeta = {
  // TODO: support single account
  type: "keyset"
} & Keyset

export type KeystoreV4WithMeta = KeystoreV4 & {
  meta: KeystoreMeta[]
}

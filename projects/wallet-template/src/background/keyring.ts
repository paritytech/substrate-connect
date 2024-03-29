import {
  type CreateDeriveFn,
  ecdsaCreateDerive,
  ed25519CreateDerive,
  sr25519CreateDerive,
} from "@polkadot-labs/hdkd"
import { keystoreV4, type KeystoreV4WithMeta } from "./keystore"
import { assert } from "./utils"
import * as storage from "./storage"
import { Keyset } from "./types"

const createDeriveFnMap = {
  Sr25519: sr25519CreateDerive,
  Ed25519: ed25519CreateDerive,
  Ecdsa: ecdsaCreateDerive,
} as Record<string, CreateDeriveFn>

export const createKeyring = () => {
  const getKeystore = () => storage.get("keystore")
  const setKeystore = (keystore: KeystoreV4WithMeta) =>
    storage.set("keystore", keystore)
  const removeKeystore = () => storage.remove("keystore")
  const getKeysets = async () =>
    (await getKeystore())?.meta.filter((m) => m.type === "keyset") ?? []
  const decodeSecrets = (secrets: Uint8Array) =>
    JSON.parse(new TextDecoder().decode(secrets)) as string[]
  const encodeSecrets = (secrets: string[]) =>
    new TextEncoder().encode(JSON.stringify(secrets))
  const getAccounts = async (chainId: string) => {
    const keystore = await getKeystore()
    if (!keystore) return []
    return keystore.meta.flatMap(({ derivationPaths }) =>
      derivationPaths
        .filter((d) => d.chainId === chainId)
        .map(({ publicKey }) => ({ publicKey })),
    )
  }

  let currentPassword: string | undefined

  return {
    async unlock(password: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      if (!keystoreV4.verifyPassword(keystore, password))
        throw new Error("invalid password")
      currentPassword = password
    },
    async lock() {
      assert(await getKeystore(), "keyring must be setup")
      currentPassword = undefined
    },
    async isLocked() {
      return !currentPassword || !(await getKeystore())
    },
    async changePassword(currentPassword: string, newPassword: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      if (!keystoreV4.verifyPassword(keystore, currentPassword))
        throw new Error("invalid password")
      await setKeystore({
        ...keystoreV4.create(
          newPassword,
          keystoreV4.decrypt(keystore, currentPassword),
        ),
        meta: keystore.meta,
      })

      // TODO: re-encrypt accounts with new password
    },
    async setup(password: string) {
      assert(!(await getKeystore()), "keyring is already setup")
      await setKeystore({
        ...keystoreV4.create(
          password,
          new TextEncoder().encode(JSON.stringify([])),
        ),
        meta: [],
      })
      currentPassword = password
    },
    async reset() {
      await removeKeystore()
      currentPassword = undefined
    },
    async hasPassword() {
      return !!(await getKeystore())
    },
    getAccounts,
    async addKeyset(keyset: Keyset, miniSecret: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      assert(currentPassword, "keyring must be unlocked")
      assert(
        ["Sr25519", "Ed25519", "Ecdsa"].includes(keyset.scheme),
        "invalid signature scheme",
      )
      const secrets = decodeSecrets(
        keystoreV4.decrypt(keystore, currentPassword),
      )
      const newKeystore = keystoreV4.create(
        currentPassword,
        encodeSecrets([...secrets, miniSecret]),
      )
      setKeystore({
        ...newKeystore,
        meta: [
          ...keystore.meta,
          {
            type: "keyset",
            ...keyset,
          },
        ],
      })
    },

    getKeysets,
    async getKeyset(name: string) {
      return (await getKeysets())?.find(
        (m) => m.type === "keyset" && m.name === name,
      )
    },
    async removeKeyset(name: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      assert(currentPassword, "keyring must be unlocked")
      const keysetIndex = keystore.meta?.findIndex((m) => m.name === name) ?? -1
      if (keysetIndex === -1) return
      const secrets = decodeSecrets(
        keystoreV4.decrypt(keystore, currentPassword),
      )
      secrets.splice(keysetIndex)
      const newKeystore = keystoreV4.create(
        currentPassword,
        encodeSecrets(secrets),
      )
      keystore.meta.splice(keysetIndex)
      setKeystore({
        ...newKeystore,
        meta: keystore.meta,
      })
    },
    async clearKeysets() {
      // update secrets/meta
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      assert(currentPassword, "keyring must be unlocked")
      const keysetIndices = keystore.meta
        ?.reduce((acc, { type }, i) => {
          if (type === "keyset") acc.push(i)
          return acc
        }, [] as number[])
        .reverse()
      const secrets = decodeSecrets(
        keystoreV4.decrypt(keystore, currentPassword),
      )
      keysetIndices.forEach((i) => {
        secrets.splice(i)
        keystore.meta.splice(i)
      })
      const newKeystore = keystoreV4.create(
        currentPassword,
        encodeSecrets(secrets),
      )
      setKeystore({
        ...newKeystore,
        meta: keystore.meta,
      })
    },
    async getKeypair(chainId: string, publicKey: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      const keysetIndex = keystore.meta.findIndex(
        ({ type, derivationPaths }) =>
          // FIXME: support plain accounts
          type === "keyset" &&
          derivationPaths.some(
            (d) => d.chainId === chainId && d.publicKey === publicKey,
          ),
      )
      if (keysetIndex === -1) throw new Error("unknown account")
      assert(currentPassword, "keyring must be unlocked")
      const secret = decodeSecrets(
        keystoreV4.decrypt(keystore, currentPassword),
      )[keysetIndex]
      const { derivationPaths, scheme } = keystore.meta[keysetIndex]
      const derivationPath = derivationPaths.find(
        (d) => d.publicKey === publicKey,
      )!
      const createDeriveFn = createDeriveFnMap[scheme]
      if (!createDeriveFn) throw new Error("invalid signature scheme")
      return [
        createDeriveFn(secret)(derivationPath.path),
        scheme as "Sr25519" | "Ed25519" | "Ecdsa",
      ] as const
    },
  }
}

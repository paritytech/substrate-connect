import {
  type CreateDeriveFn,
  ecdsaCreateDerive,
  ed25519CreateDerive,
  sr25519CreateDerive,
} from "@polkadot-labs/hdkd"
import { sr25519, ed25519, ecdsa, KeyPair } from "@polkadot-labs/hdkd-helpers"
import { keystoreV4, type KeystoreV4WithMeta } from "./keystore"
import { assert } from "./utils"
import * as storage from "./storage"
import { InsertKeysetArgs } from "./types"
import { fromHex, toHex } from "@polkadot-api/utils"

const createDeriveFnMap = {
  Sr25519: sr25519CreateDerive,
  Ed25519: ed25519CreateDerive,
  Ecdsa: ecdsaCreateDerive,
} as Record<string, CreateDeriveFn>

const privateKeyToPublicKey = (privateKey: string, scheme: string) => {
  switch (scheme) {
    case "Sr25519":
      return toHex(sr25519.getPublicKey(privateKey))
    case "Ed25519":
      return toHex(ed25519.getPublicKey(privateKey))
    case "Ecdsa":
      return toHex(ecdsa.getPublicKey(privateKey))
    default:
      throw new Error("unsupported scheme")
  }
}

export const createKeyring = () => {
  const getKeystore = () => storage.get("keystore")
  const setKeystore = (keystore: KeystoreV4WithMeta) =>
    storage.set("keystore", keystore)
  const removeKeystore = () => storage.remove("keystore")
  const getKeysets = async () => {
    const keysets = (await getKeystore())?.meta ?? []

    return keysets.map((meta) => ({
      name: meta.name,
      scheme: meta.scheme,
      accounts: [
        ...meta.derivationPaths.map((d) => ({
          ...d,
          _type: "DerivationPath" as const,
        })),
        ...meta.importedPrivateKeys.map((privateKey) => {
          const publicKey = privateKeyToPublicKey(privateKey, meta.scheme)
          return {
            _type: "SignOnly" as const,
            publicKey,
          }
        }),
        ...meta.importedPublicKeys.map((publicKey) => ({
          _type: "ViewOnly" as const,
          publicKey,
        })),
      ],
      createdAt: meta.createdAt,
    }))
  }
  const decodeSecrets = (secrets: Uint8Array) =>
    JSON.parse(new TextDecoder().decode(secrets)) as string[]
  const encodeSecrets = (secrets: string[]) =>
    new TextEncoder().encode(JSON.stringify(secrets))
  const getAccounts = async (chainId: string) => {
    const keystore = await getKeystore()
    if (!keystore) return []
    return keystore.meta.flatMap(
      ({
        scheme,
        derivationPaths,
        importedPrivateKeys,
        importedPublicKeys,
      }) => [
        ...derivationPaths
          .filter((d) => d.chainId === chainId)
          .map(({ publicKey }) => ({ publicKey })),
        ...importedPrivateKeys.map(
          (privateKey) => ({
            publicKey: privateKeyToPublicKey(privateKey, scheme),
          }),
          ...importedPublicKeys.map((publicKey) => ({ publicKey })),
        ),
      ],
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
    async insertKeyset(args: InsertKeysetArgs) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      assert(currentPassword, "keyring must be unlocked")
      assert(
        ["Sr25519", "Ed25519", "Ecdsa"].includes(args.scheme),
        "invalid signature scheme",
      )
      const secrets = decodeSecrets(
        keystoreV4.decrypt(keystore, currentPassword),
      )
      const newKeystore = keystoreV4.create(
        currentPassword,
        encodeSecrets([...secrets, args.miniSecret]),
      )
      setKeystore({
        ...newKeystore,
        meta: [
          ...keystore.meta,
          {
            ...args,
            derivationPaths: args.derivationPaths ?? [],
            importedPrivateKeys: args.importedPrivateKeys ?? [],
            importedPublicKeys: args.importedPublicKeys ?? [],
          },
        ],
      })
    },
    getKeysets,
    async getKeyset(name: string) {
      return (await getKeysets())?.find((m) => m.name === name)
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
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      assert(currentPassword, "keyring must be unlocked")
      const keysetIndices = keystore.meta
        ?.reduce((acc, _, i) => {
          acc.push(i)
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
    async importPrivateKey(keysetName: string, privateKey: string) {
      assert(currentPassword, "keyring must be unlocked")
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      const keysets = keystore.meta ?? []

      const keyset = keysets.find((m) => m.name === keysetName)
      if (!keyset) {
        throw new Error(`keyset "${keysetName}" does not exist`)
      }
      if (keyset.importedPrivateKeys.includes(privateKey)) return
      keyset.importedPrivateKeys.push(privateKey)
      const idx = keysets.findIndex((m) => m.name === keysetName)
      keysets.splice(idx, 1, keyset)

      keystore.meta = keysets

      setKeystore(keystore)
    },
    async getKeypair(chainId: string, publicKey: string) {
      assert(currentPassword, "keyring must be unlocked")
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")

      const keysetIndex = keystore.meta.findIndex(({ derivationPaths }) =>
        derivationPaths.some(
          (d) => d.chainId === chainId && d.publicKey === publicKey,
        ),
      )
      if (keysetIndex !== -1) {
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
      }

      for (const keyset of keystore.meta) {
        for (const privateKey of keyset.importedPrivateKeys) {
          const keypairPublicKey = privateKeyToPublicKey(
            privateKey,
            keyset.scheme,
          )
          if (keypairPublicKey === publicKey) {
            const publicKeyBytes = fromHex(keypairPublicKey)
            let keypair: KeyPair = {
              publicKey: publicKeyBytes,
              sign: (msg) => {
                switch (keyset.scheme) {
                  case "Sr25519":
                    return sr25519.sign(fromHex(privateKey), msg)
                  case "Ed25519":
                    return ed25519.sign(fromHex(privateKey), msg)
                  case "Ecdsa":
                    return ecdsa.sign(fromHex(privateKey), msg)
                }
              },
            }

            return [keypair, keyset.scheme] as const
          }
        }
      }

      throw new Error("unknown account")
    },
  }
}

import {
  type CreateDeriveFn,
  ecdsaCreateDerive,
  ed25519CreateDerive,
  sr25519CreateDerive,
} from "@polkadot-labs/hdkd"
import {
  sr25519,
  ed25519,
  ecdsa,
  KeyPair,
  Curve,
} from "@polkadot-labs/hdkd-helpers"
import { KeystoreMeta, keystoreV4, type KeystoreV4WithMeta } from "./keystore"
import { assert } from "./utils"
import * as storage from "./storage"
import { InsertCryptoKeyArgs, KeystoreAccount } from "./types"
import { toHex } from "@polkadot-api/utils"

const createDeriveFnMap: Record<string, CreateDeriveFn> = {
  Sr25519: sr25519CreateDerive,
  Ed25519: ed25519CreateDerive,
  Ecdsa: ecdsaCreateDerive,
}

const curveFnMap: Record<string, Curve> = {
  Sr25519: sr25519,
  Ed25519: ed25519,
  Ecdsa: ecdsa,
}

const createKeyPair = (privateKey: string, scheme: string): KeyPair => {
  const curve = curveFnMap[scheme]
  if (!curve) throw new Error("unsupported signature scheme")

  return {
    publicKey: curve.getPublicKey(privateKey),
    sign(message) {
      return curve.sign(message, privateKey)
    },
  }
}

export const createKeyring = () => {
  const getKeystore = () => storage.get("keystore")
  const setKeystore = (keystore: KeystoreV4WithMeta) =>
    storage.set("keystore", keystore)
  const removeKeystore = () => storage.remove("keystore")

  const getKeystoreAccounts = (
    keystoreMeta: KeystoreMeta,
  ): KeystoreAccount[] => {
    switch (keystoreMeta.type) {
      case "KeysetKeystore":
        return keystoreMeta.derivationPaths.map((d) => ({
          ...d,
          type: "Keyset",
        }))
      case "KeypairKeystore":
        return [
          {
            type: "Keypair",
            publicKey: keystoreMeta.publicKey,
          },
        ]
    }
  }

  const getCryptoKeys = async () => {
    const keys = (await getKeystore())?.meta ?? []

    return keys.map((meta) => ({
      name: meta.name,
      scheme: meta.scheme,
      accounts: getKeystoreAccounts(meta),
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

    return keystore.meta
      .flatMap(getKeystoreAccounts)
      .filter(
        (account) =>
          (account.type === "Keyset" && account.chainId === chainId) ||
          account.type !== "Keyset",
      )
  }

  const insertCryptoKey = async (args: InsertCryptoKeyArgs) => {
    const keystore = await getKeystore()
    assert(keystore, "keyring must be setup")
    assert(currentPassword, "keyring must be unlocked")
    assert(
      ["Sr25519", "Ed25519", "Ecdsa"].includes(args.scheme),
      "invalid signature scheme",
    )

    const secrets = decodeSecrets(keystoreV4.decrypt(keystore, currentPassword))
    const secret = args.type === "Keyset" ? args.miniSecret : args.privatekey
    const newKeystore = keystoreV4.create(
      currentPassword,
      encodeSecrets([...secrets, secret]),
    )

    const newCryptoKey =
      args.type === "Keyset"
        ? {
            type: "KeysetKeystore" as const,
            derivationPaths: args.derivationPaths,
          }
        : args.type === "Keypair"
          ? {
              type: "KeypairKeystore" as const,
              publicKey: toHex(
                createKeyPair(args.privatekey, args.scheme).publicKey,
              ),
            }
          : undefined
    if (!newCryptoKey) throw new Error("invalid keystore type")

    setKeystore({
      ...newKeystore,
      meta: [
        ...keystore.meta,
        {
          name: args.name,
          scheme: args.scheme,
          createdAt: args.createdAt,
          ...newCryptoKey,
        },
      ],
    })
  }

  const removeCryptoKey = async (name: string) => {
    const keystore = await getKeystore()
    assert(keystore, "keyring must be setup")
    assert(currentPassword, "keyring must be unlocked")
    const cryptoKeyIndex =
      keystore.meta?.findIndex((m) => m.name === name) ?? -1
    if (cryptoKeyIndex === -1) return
    const secrets = decodeSecrets(keystoreV4.decrypt(keystore, currentPassword))
    secrets.splice(cryptoKeyIndex)
    const newKeystore = keystoreV4.create(
      currentPassword,
      encodeSecrets(secrets),
    )
    keystore.meta.splice(cryptoKeyIndex)
    setKeystore({
      ...newKeystore,
      meta: keystore.meta,
    })
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
    insertCryptoKey,
    getCryptoKeys,
    async getCryptoKey(name: string) {
      return (await getCryptoKeys())?.find((m) => m.name === name)
    },
    removeCryptoKey,
    async clearCryptoKeys() {
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
    async getKeypair(chainId: string, publicKey: string) {
      assert(currentPassword, "keyring must be unlocked")
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")

      const keysetIndex = keystore.meta.findIndex((keyset) => {
        switch (keyset.type) {
          case "KeysetKeystore":
            return keyset.derivationPaths.some(
              (d) => d.chainId === chainId && d.publicKey === publicKey,
            )
          case "KeypairKeystore":
            return keyset.publicKey === publicKey
          default:
            throw new Error("invalid keystore type")
        }
      })

      if (keysetIndex === -1) {
        throw new Error("unknown account")
      }

      const secret = decodeSecrets(
        keystoreV4.decrypt(keystore, currentPassword),
      )[keysetIndex]

      const cryptoKey = keystore.meta[keysetIndex]
      switch (cryptoKey.type) {
        case "KeysetKeystore": {
          const { derivationPaths, scheme } = cryptoKey
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
        case "KeypairKeystore": {
          let keypair = createKeyPair(secret, cryptoKey.scheme)

          return [keypair, cryptoKey.scheme] as const
        }
      }
    },
  }
}

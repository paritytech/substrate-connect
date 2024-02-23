import { toHex, fromHex } from "@polkadot-api/utils"

export type Cipher = {
  encrypt(plaintext: Uint8Array): Uint8Array
  decrypt(ciphertext: Uint8Array): Uint8Array
}

type StorageArea = {
  get: chrome.Storage.StorageArea["get"]
  set: chrome.Storage.StorageArea["set"]
}

export const createSecureLocalStorage = <T extends StorageArea>(
  cipher: Cipher,
  storage: T,
): T => {
  const textEncoder = new TextEncoder()
  const textDecoder = new TextDecoder()

  const set: StorageArea["set"] = async (items) => {
    const encryptedItems = Object.entries(items).map(
      ([key, value]): [string, string] => {
        const encrypted = toHex(cipher.encrypt(textEncoder.encode(value)))
        return [key, encrypted]
      },
    )

    await storage.set(Object.fromEntries(encryptedItems))
  }

  const get: StorageArea["get"] = async (keys) => {
    const encryptedItems = await storage.get(keys)
    const decryptedItems = Object.entries(encryptedItems).map(
      ([key, value]): [string, string] => {
        if (!value) {
          return [key, value]
        }

        const plainText = textDecoder.decode(cipher.decrypt(fromHex(value)))

        return [key, plainText]
      },
    )

    return decryptedItems
  }

  return {
    ...storage,
    set,
    get,
  }
}

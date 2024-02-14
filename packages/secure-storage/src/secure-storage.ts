import { managedNonce } from "@noble/ciphers/webcrypto"
import { sha256 } from "@noble/hashes/sha256"
import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import { toHex, fromHex } from "@polkadot-api/utils"

const wxchacha = managedNonce(xchacha20poly1305)

export type SecureLocalStorage = {
  setItem: (typeof localStorage)["setItem"]
  getItem: (typeof localStorage)["getItem"]
  removeItem: (typeof localStorage)["removeItem"]
  clear: (typeof localStorage)["clear"]
}

export const createSecureLocalStorage = (
  password: Uint8Array,
): SecureLocalStorage => {
  const textEncoder = new TextEncoder()
  const textDecoder = new TextDecoder()

  const cipher = wxchacha(sha256(password))

  const setItem: SecureLocalStorage["setItem"] = (key, value) => {
    const encrypted = toHex(cipher.encrypt(textEncoder.encode(value)))

    localStorage.setItem(key, encrypted)
  }

  const getItem: SecureLocalStorage["getItem"] = (key) => {
    const item = localStorage.getItem(key)
    if (!item) {
      return null
    }

    return textDecoder.decode(cipher.decrypt(fromHex(item)))
  }

  const removeItem: SecureLocalStorage["removeItem"] = (key) =>
    localStorage.removeItem(key)

  const clear: SecureLocalStorage["clear"] = () => localStorage.clear()

  return {
    setItem,
    getItem,
    removeItem,
    clear,
  }
}

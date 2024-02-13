import { scryptAsync } from "@noble/hashes/scrypt"
import { webcrypto } from "crypto"

import { managedNonce } from "@noble/ciphers/webcrypto"
import { xchacha20poly1305 } from "@noble/ciphers/chacha"

export type ScryptOptions = {
  N: number
  r: number
  p: number
  dkLen: number
  saltLen: number
}

export const SCRYPT_DEFAULT_OPTIONS: ScryptOptions = {
  N: 2 ** 16,
  r: 8,
  p: 1,
  dkLen: 32,
  saltLen: 16,
}

export async function encryptPassword(
  password: string | Uint8Array,
  options: ScryptOptions = SCRYPT_DEFAULT_OPTIONS,
): Promise<Uint8Array> {
  const salt = new Uint8Array(options.saltLen)
  webcrypto.getRandomValues(salt)

  return scryptAsync(password, salt, {
    N: options.N,
    r: options.r,
    p: options.p,
    dkLen: options.dkLen,
  })
}

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

  const setItem: SecureLocalStorage["setItem"] = (key, value) => {
    localStorage.setItem(
      key,
      textDecoder.decode(
        encryptWithPassword(textEncoder.encode(value), password),
      ),
    )
  }

  const getItem: SecureLocalStorage["getItem"] = (key) => {
    const item = localStorage.getItem(key)
    if (!item) {
      return null
    }

    return textDecoder.decode(
      decryptWithPassword(password, textEncoder.encode(item)),
    )
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

const encryptWithPassword = (
  password: Uint8Array,
  data: Uint8Array,
): Uint8Array => {
  const cipher = wxchacha(password)

  return cipher.encrypt(data)
}

const decryptWithPassword = (
  password: Uint8Array,
  data: Uint8Array,
): Uint8Array => {
  const cipher = wxchacha(password)

  return cipher.decrypt(data)
}

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

export function encryptWithPassword(
  password: Uint8Array,
  data: Uint8Array,
): Uint8Array {
  const cipher = wxchacha(password)

  return cipher.encrypt(data)
}

export function decryptWithPassword(
  password: Uint8Array,
  data: Uint8Array,
): Uint8Array {
  const cipher = wxchacha(password)

  return cipher.decrypt(data)
}

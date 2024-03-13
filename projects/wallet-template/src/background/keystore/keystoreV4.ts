import { scrypt } from "@noble/hashes/scrypt"
import { pbkdf2 } from "@noble/hashes/pbkdf2"
import { sha256 } from "@noble/hashes/sha256"
import { ctr as aesCtr } from "@noble/ciphers/aes"
import {
  bytesToHex,
  concatBytes,
  hexToBytes,
  randomBytes,
} from "@noble/hashes/utils"
import { managedNonce } from "@noble/ciphers/webcrypto"
import { xsalsa20poly1305 } from "@noble/ciphers/salsa"

export type Cipher = {
  encrypt(plaintext: Uint8Array): Uint8Array
  decrypt(ciphertext: Uint8Array): Uint8Array
}

export type KeyStoreV4 = {
  version: 4
  uuid: string
  description?: string
  crypto: {
    kdf: KdfModule
    checksum: ChecksumModule
    cipher: CipherModule
  }
}

type KdfModule = ScryptKdfModule | Pbkdf2KdfModule

type ScryptKdfModule = {
  function: "scrypt"
  params: {
    dklen: number
    n: number
    p: number
    r: number
    salt: string
  }
  message: string
}

type Pbkdf2KdfModule = {
  function: "pbkdf2"
  params: {
    dklen: number
    c: number
    prf: string
    salt: string
  }
  message: string
}

type ChecksumModule = {
  function: "sha256"
  params: {}
  message: string
}

type CipherModule = Aes128CtrCipherModule | Xsalsa20Poly1305

type Aes128CtrCipherModule = {
  function: "aes-128-ctr"
  params: {
    iv: string
  }
  message: string
}

type Xsalsa20Poly1305 = {
  function: "xsalsa20-poly1305"
  params: {}
  message: string
}

export const create = (password: string, secret: Uint8Array): KeyStoreV4 => {
  const kdf = {
    function: "scrypt" as const,
    params: {
      dklen: 32,
      n: 2 ** 16,
      r: 8,
      p: 1,
      salt: bytesToHex(randomBytes(32)),
    },
    message: "",
  }
  const key = deriveKey(kdf, password)
  const ciphertext = getCipher_(
    {
      function: "xsalsa20-poly1305",
      params: {},
      message: "",
    },
    key,
  ).encrypt(secret)
  return {
    version: 4,
    uuid: crypto.randomUUID(),
    crypto: {
      kdf,
      checksum: {
        function: "sha256",
        params: {},
        message: bytesToHex(computeChecksum(key.slice(16, 32), ciphertext)),
      },
      cipher: {
        function: "xsalsa20-poly1305",
        params: {},
        message: bytesToHex(ciphertext),
      },
    },
  }
}

const controlCodeFilter = (charCode: number) =>
  charCode > 0x1f && !(charCode >= 0x7f && charCode <= 0x9f)

const encodePassword = (password: string) =>
  new TextEncoder().encode(
    password
      .normalize("NFKD")
      .split("")
      .filter((char) => controlCodeFilter(char.charCodeAt(0)))
      .join(""),
  )

const deriveKey = (kdf: KdfModule, password: string) => {
  if (kdf.function === "scrypt") {
    const { salt, dklen: dkLen, n: N, p, r } = kdf.params
    return scrypt(encodePassword(password), hexToBytes(salt), {
      dkLen,
      N,
      p,
      r,
    })
  } else if (kdf.function === "pbkdf2") {
    const { salt, prf, dklen: dkLen, c } = kdf.params
    if (prf !== "hmac-sha256") throw new Error("Invalid prf")
    return pbkdf2(sha256, encodePassword(password), hexToBytes(salt), {
      dkLen,
      c,
    })
  }
  throw new Error("Invalid key derivation function")
}

const computeChecksum = (key: Uint8Array, ciphertext: Uint8Array) =>
  sha256(concatBytes(key, ciphertext))

const verifyChecksum = (
  checksum: ChecksumModule,
  key: Uint8Array,
  ciphertext: Uint8Array,
) => {
  if (checksum.function !== "sha256")
    throw new Error("Invalid checksum function")
  return checksum.message === bytesToHex(computeChecksum(key, ciphertext))
}

export const verifyPassword = (
  { crypto: { kdf, cipher, checksum } }: KeyStoreV4,
  password: string,
) => {
  const decryptionKey = deriveKey(kdf, password)
  const ciphertext = hexToBytes(cipher.message)
  return verifyChecksum(checksum, decryptionKey.slice(16, 32), ciphertext)
}

export const decrypt = (keystore: KeyStoreV4, password: string) => {
  const ciphertext = hexToBytes(keystore.crypto.cipher.message)
  return getCipher(keystore, password).decrypt(ciphertext)
}

const getCipher_ = (cipher: CipherModule, key: Uint8Array) => {
  if (cipher.function === "xsalsa20-poly1305")
    return managedNonce(xsalsa20poly1305)(key.slice(0, 32))
  else if (cipher.function === "aes-128-ctr")
    return aesCtr(key.slice(0, 16), hexToBytes(cipher.params.iv))

  throw new Error("Invalid cipher function")
}

export const getCipher = (
  { crypto: { kdf, checksum, cipher } }: KeyStoreV4,
  password: string,
): Cipher => {
  const ciphertext = hexToBytes(cipher.message)
  const key = deriveKey(kdf, password)
  if (!verifyChecksum(checksum, key.slice(16, 32), ciphertext))
    throw new Error("Invalid password")
  return getCipher_(cipher, key)
}

import { scrypt } from "@noble/hashes/scrypt"
import { sha256 } from "@noble/hashes/sha256"
import { ctr as aesCtr } from "@noble/ciphers/aes"
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils"
import { managedNonce } from "@noble/ciphers/webcrypto"
import { xsalsa20poly1305 } from "@noble/ciphers/salsa"

export type KeyStore = {
  version: 4
  uuid: string
  description?: string
  crypto: {
    kdf: KdfModule
    checksum: ChecksumModule
    cipher: CipherModule
  }
}

type KdfModule = {
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

export const create = (password: string): KeyStore => {
  throw new Error("not implemented")
  return {
    version: 4,
    uuid: "",
    crypto: {
      kdf: {
        function: "scrypt",
        params: { dklen: 0, n: 0, p: 0, r: 0, salt: "" },
        message: "",
      },
      checksum: { function: "sha256", params: {}, message: "" },
      cipher: { function: "xsalsa20-poly1305", params: {}, message: "" },
    },
  }
}

const controlCodeFilter = (charCode: number) =>
  charCode > 0x1f && !(charCode >= 0x7f && charCode <= 0x9f)

const encodePassword = (password: string) =>
  bytesToHex(
    new TextEncoder().encode(
      password
        .normalize("NFKD")
        .split("")
        .filter((char) => controlCodeFilter(char.charCodeAt(0)))
        .join(""),
    ),
  )

const deriveKey = (kdf: KdfModule, password: string) => {
  if (kdf.function !== "scrypt")
    throw new Error("Invalid key derivation function")
  const { salt, ...params } = kdf.params
  return scrypt(hexToBytes(encodePassword(password)), hexToBytes(salt), {
    dkLen: params.dklen,
    N: params.n,
    p: params.p,
    r: params.r,
  })
}

const verifyChecksum = (
  checksum: ChecksumModule,
  key: Uint8Array,
  ciphertext: Uint8Array,
) => {
  if (checksum.function !== "sha256")
    throw new Error("Invalid checksum function")
  return checksum.message === bytesToHex(sha256(concatBytes(key, ciphertext)))
}

export const verifyPassword = (
  { crypto: { kdf, cipher, checksum } }: KeyStore,
  password: string,
) => {
  const decryptionKey = deriveKey(kdf, password)
  const ciphertext = hexToBytes(cipher.message)
  return verifyChecksum(checksum, decryptionKey.slice(16), ciphertext)
}

export const decrypt = (keystore: KeyStore, password: string) => {
  const ciphertext = hexToBytes(keystore.crypto.cipher.message)
  return bytesToHex(getCipher(keystore, password).decrypt(ciphertext))
}

const getCipher_ = (cipher: CipherModule, key: Uint8Array) => {
  if (cipher.function === "xsalsa20-poly1305") {
    // FIXME: should the key be truncated?
    return managedNonce(xsalsa20poly1305)(key)
  } else if (cipher.function === "aes-128-ctr") {
    return aesCtr(key.slice(0, 16), hexToBytes(cipher.params.iv))
  }
  throw new Error("Invalid cipher function")
}

export const getCipher = (
  { crypto: { kdf, checksum, cipher } }: KeyStore,
  password: string,
) => {
  const ciphertext = hexToBytes(cipher.message)
  const key = deriveKey(kdf, password)
  if (!verifyChecksum(checksum, key.slice(16), ciphertext))
    throw new Error("Invalid password")
  return getCipher_(cipher, key)
}

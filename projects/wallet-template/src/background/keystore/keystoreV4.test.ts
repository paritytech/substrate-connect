import { expect, it, describe } from "vitest"

import { type KeystoreV4, verifyPassword, decrypt, create } from "./keystoreV4"
import { hexToBytes, randomBytes } from "@noble/hashes/utils"

type TestVector = {
  password: string
  encodedPassword: string
  secret: string
  keystoreJson: KeystoreV4
}
// From https://eips.ethereum.org/EIPS/eip-2335#test-cases
const testVectors: TestVector[] = [
  {
    password: "𝔱𝔢𝔰𝔱𝔭𝔞𝔰𝔰𝔴𝔬𝔯𝔡🔑",
    encodedPassword: "7465737470617373776f7264f09f9491",
    secret: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
    keystoreJson: {
      crypto: {
        kdf: {
          function: "scrypt",
          params: {
            dklen: 32,
            n: 262144,
            p: 1,
            r: 8,
            salt: "d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3",
          },
          message: "",
        },
        checksum: {
          function: "sha256",
          params: {},
          message:
            "d2217fe5f3e9a1e34581ef8a78f7c9928e436d36dacc5e846690a5581e8ea484",
        },
        cipher: {
          function: "aes-128-ctr",
          params: {
            iv: "264daa3f303d7259501c93d997d84fe6",
          },
          message:
            "06ae90d55fe0a6e9c5c3bc5b170827b2e5cce3929ed3f116c2811e6366dfe20f",
        },
      },
      description:
        "This is a test keystore that uses scrypt to secure the secret.",
      pubkey:
        "9612d7a727c9d0a22e185a1c768478dfe919cada9266988cb32359c11f2b7b27f4ae4040902382ae2910c15e2b420d07",
      path: "m/12381/60/3141592653/589793238",
      uuid: "1d85ae20-35c5-4611-98e8-aa14a633906f",
      version: 4,
    } as KeystoreV4,
  },
  {
    password: "𝔱𝔢𝔰𝔱𝔭𝔞𝔰𝔰𝔴𝔬𝔯𝔡🔑",
    encodedPassword: "7465737470617373776f7264f09f9491",
    secret: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
    keystoreJson: {
      crypto: {
        kdf: {
          function: "pbkdf2",
          params: {
            dklen: 32,
            c: 262144,
            prf: "hmac-sha256",
            salt: "d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3",
          },
          message: "",
        },
        checksum: {
          function: "sha256",
          params: {},
          message:
            "8a9f5d9912ed7e75ea794bc5a89bca5f193721d30868ade6f73043c6ea6febf1",
        },
        cipher: {
          function: "aes-128-ctr",
          params: {
            iv: "264daa3f303d7259501c93d997d84fe6",
          },
          message:
            "cee03fde2af33149775b7223e7845e4fb2c8ae1792e5f99fe9ecf474cc8c16ad",
        },
      },
      description:
        "This is a test keystore that uses PBKDF2 to secure the secret.",
      pubkey:
        "9612d7a727c9d0a22e185a1c768478dfe919cada9266988cb32359c11f2b7b27f4ae4040902382ae2910c15e2b420d07",
      path: "m/12381/60/0/0",
      uuid: "64625def-3331-4eea-ab6f-782f3ed16a83",
      version: 4,
    } as KeystoreV4,
  },
]

describe.each(testVectors)("test vector", (testVector) => {
  it("should verifyPassword", () => {
    expect(verifyPassword(testVector.keystoreJson, testVector.password)).toBe(
      true,
    )
    expect(verifyPassword(testVector.keystoreJson, "invalid password")).toBe(
      false,
    )
  })

  it("should decrypt", () => {
    expect(decrypt(testVector.keystoreJson, testVector.password)).toStrictEqual(
      hexToBytes(testVector.secret),
    )
    expect(() => decrypt(testVector.keystoreJson, "invalid password")).toThrow()
  })
})

it("should create keystore", () => {
  const secret = randomBytes(32)
  const keystore = create("123456", secret)
  expect(verifyPassword(keystore, "123456")).toBe(true)
  expect(verifyPassword(keystore, "invalid password")).toBe(false)
  expect(decrypt(keystore, "123456")).toStrictEqual(secret)
  expect(() => decrypt(keystore, "invalid password")).toThrow()
})

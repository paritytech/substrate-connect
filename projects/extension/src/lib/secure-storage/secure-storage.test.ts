import { beforeEach, describe, expect, test } from "vitest"
import { createSecureLocalStorage } from "./secure-storage"
import { managedNonce } from "@noble/ciphers/webcrypto"
import { sha256 } from "@noble/hashes/sha256"
import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import { fakeBrowser } from "wxt/testing"

const wxchacha = managedNonce(xchacha20poly1305)

describe("secure storage", async () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  const textEncoder = new TextEncoder()
  const password = textEncoder.encode("password")
  const cipher = wxchacha(sha256(password))

  test("sanity", async () => {
    const storage = fakeBrowser.storage.local
    const secureLocalStorage = createSecureLocalStorage(cipher, storage)

    await secureLocalStorage.set({ foo: "foobar", bar: "baz" })

    await expect(storage.get("foo")).resolves.not.toEqual([["foo", "foobar"]])
    await expect(secureLocalStorage.get("foo")).resolves.toEqual([
      ["foo", "foobar"],
    ])
    await expect(secureLocalStorage.get("bar")).resolves.toEqual([
      ["bar", "baz"],
    ])
    await expect(storage.get("bar")).not.resolves.toEqual([["bar", "baz"]])

    await secureLocalStorage.remove("foo")
    await expect(secureLocalStorage.get("foo")).resolves.toEqual([
      ["foo", undefined],
    ])
    await secureLocalStorage.clear()
    await expect(secureLocalStorage.get("bar")).resolves.toEqual([
      ["bar", undefined],
    ])
  })
})

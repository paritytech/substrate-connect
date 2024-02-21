import { afterEach, describe, expect, test } from "vitest"
import { createSecureLocalStorage } from "./secure-storage"
import { managedNonce } from "@noble/ciphers/webcrypto"
import { sha256 } from "@noble/hashes/sha256"
import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import browser from "webextension-polyfill"

const wxchacha = managedNonce(xchacha20poly1305)

describe("secure storage", async () => {
  const textEncoder = new TextEncoder()
  const password = textEncoder.encode("password")
  const cipher = wxchacha(sha256(password))
  const secureLocalStorage = createSecureLocalStorage(
    cipher,
    browser.storage.local,
  )

  afterEach(() => {
    secureLocalStorage.clear()
  })

  test("sanity test", () => {
    secureLocalStorage.set({ foo: "foobar", bar: "baz" })

    expect(secureLocalStorage.get("foo")).toEqual("foobar")
    expect(secureLocalStorage.get("bar")).toEqual("baz")

    secureLocalStorage.remove("foo")
    expect(secureLocalStorage.get("foo")).toBeNull()

    secureLocalStorage.clear()
    expect(secureLocalStorage.get("bar")).toBeNull()
  })
})

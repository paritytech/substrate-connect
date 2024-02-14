import { afterEach, describe, expect, test } from "vitest"
import { createSecureLocalStorage } from "./secure-storage"

describe("secure storage", async () => {
  const textEncoder = new TextEncoder()
  const password = textEncoder.encode("password")
  const secureLocalStorage = createSecureLocalStorage(password)

  afterEach(() => {
    secureLocalStorage.clear()
  })

  test("sanity test", () => {
    secureLocalStorage.setItem("foo", "foobar")
    secureLocalStorage.setItem("bar", "baz")

    expect(secureLocalStorage.getItem("foo")).toEqual("foobar")
    expect(secureLocalStorage.getItem("bar")).toEqual("baz")

    secureLocalStorage.removeItem("foo")
    expect(secureLocalStorage.getItem("foo")).toBeNull()

    secureLocalStorage.clear()
    expect(secureLocalStorage.getItem("bar")).toBeNull()
  })
})

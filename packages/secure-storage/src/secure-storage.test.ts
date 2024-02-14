import { afterEach, describe, expect, test } from "vitest"
import { createSecureLocalStorage } from "./secure-storage"

describe("secure storage", async () => {
  const textEncoder = new TextEncoder()
  const password = textEncoder.encode("password")
  const secureLocalStorage = createSecureLocalStorage(password)

  afterEach(() => {
    secureLocalStorage.clear()
  })

  test("get and set", () => {
    secureLocalStorage.setItem("foo", "foobar")

    expect(secureLocalStorage.getItem("foo")).toEqual("foobar")
  })
})

import { describe, bench } from "vitest"
import { encryptPassword } from "./"

describe("password", () => {
  bench(
    "encrypt password",
    () => {
      encryptPassword("password")
    },
    { time: 1000 },
  )
})

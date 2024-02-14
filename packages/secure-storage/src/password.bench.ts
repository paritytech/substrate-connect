import { describe, bench } from "vitest"
import { encryptPassword } from "./password"

describe("password", () => {
  bench(
    "encrypt password",
    async () => {
      await encryptPassword("password")
    },
    { time: 1000 },
  )
})

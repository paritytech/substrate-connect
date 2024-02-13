import { it, describe } from "vitest"
import { encryptPassword } from "./password"

describe("password", () => {
  it(
    "should encrypt a password under 250ms",
    async () => {
      await new Promise<void>((res) => {
        encryptPassword("yoloswag")
        res()
      })
    },
    {
      timeout: 250,
    },
  )
})

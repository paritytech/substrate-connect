/* eslint-disable @typescript-eslint/unbound-method */
import { capitalizeFirstLetter, isEmpty } from "./utils"

const random = (length = 5) => {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  let str = ""
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

test("Test capitalizeFirstLetter", () => {
  const str = random()
  const strFirstLetter = str.charAt(0).toUpperCase()
  const outcome = capitalizeFirstLetter(str)
  expect(outcome.charAt(0)).toBe(strFirstLetter)
})

test("Test isEmpty", () => {
  let obj = {}
  let outcome = isEmpty(obj)
  expect(outcome).toBeTruthy
  obj = { something: "else" }
  outcome = isEmpty(obj)
  expect(outcome).toBeFalsy
})

import { describe, test } from "vitest"
import { render } from "@testing-library/react"
import CreatePassword from "./CreatePassword"

describe("create password", () => {
  test("create password", () => {
    const { getByTestId } = render(<CreatePassword passwordKey="password" />)
    const passwordField = getByTestId("password-field")
    console.log("passwordField", passwordField)
  })
})

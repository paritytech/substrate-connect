import { createContext } from "react"

export type AccountContext = {
  currentKeyset: string
}

export const AccountContext = createContext<AccountContext>({
  currentKeyset: "",
})

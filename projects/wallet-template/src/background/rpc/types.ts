import type { LightClientPageHelper } from "@substrate/light-client-extension-helpers/background"
import { UserSignedExtensions } from "../../types/UserSignedExtension"
import { Account, SignRequest } from "../types"

export type SignResponse = {
  userSignedExtensions: Partial<UserSignedExtensions>
}

export type InternalSignRequest = {
  resolve: (props: SignResponse) => void
  reject: (reason?: any) => void
} & SignRequest

export type Context = {
  lightClientPageHelper: LightClientPageHelper
  signRequests: Record<string, InternalSignRequest>
  port: chrome.runtime.Port
  notifyOnAccountsChanged: (accounts: Account[]) => void
}

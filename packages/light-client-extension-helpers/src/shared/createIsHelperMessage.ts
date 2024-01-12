import { ToPage, ToExtension, BackgroundRequest } from "@/protocol"

export const createIsHelperMessage =
  <T = unknown>(
    validOrigins: readonly (
      | ToPage
      | ToExtension
      | BackgroundRequest
    )["origin"][],
  ) =>
  (msg: any): msg is T => {
    if (!msg) return false
    if (!validOrigins.includes(msg?.origin)) return false
    // FIXME:
    // if (!msg?.type) return false
    return true
  }

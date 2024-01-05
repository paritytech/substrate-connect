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
    if (!msg?.type) return false
    return true
  }

// TODO:
// export const createIsHelperMessageV2 =
//   <
//     T extends ToPage | ToExtension | BackgroundRequest,
//     TOrigins extends T["origin"][],
//   >(
//     validOrigins: TOrigins,
//   ) =>
//   (msg: any): msg is T & { origin: TOrigins[number] } => {
//     if (!msg) return false
//     if (!validOrigins.includes(msg?.origin)) return false
//     if (!msg?.type) return false
//     return true
//   }

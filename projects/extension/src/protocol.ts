import type {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

export type ToBackground = { type: "keep-alive" } | ToExtension
export type ToContent = { type: "keep-alive-ack" } | ToApplication

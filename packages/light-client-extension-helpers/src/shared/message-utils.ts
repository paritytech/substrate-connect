import {
  ToExtension,
  ToApplication,
} from "@substrate/connect-extension-protocol"
import { RpcMessage, isRpcMessage } from "."

export const isSubstrateConnectMessage = (
  msg: any,
): msg is ToApplication | ToExtension =>
  isSubstrateConnectToApplicationMessage(msg) ||
  isSubstrateConnectToExtensionMessage(msg)

export const isSubstrateConnectToExtensionMessage = (
  msg: any,
): msg is ToExtension => {
  if (typeof msg !== "object") return false
  if (msg.origin !== "substrate-connect-client") return false
  return true
}

export const isSubstrateConnectToApplicationMessage = (
  msg: any,
): msg is ToApplication => {
  if (typeof msg !== "object") return false
  if (msg.origin !== "substrate-connect-extension") return false
  return true
}

export const isRpcMessageWithOrigin = <TOrigin extends string>(
  msg: any,
  origin: TOrigin,
): msg is RpcMessage & { origin: TOrigin } => {
  if (!isRpcMessage(msg)) return false
  if ("origin" in msg && msg.origin !== origin) return false
  return true
}

export type RpcMessageWithOrigin<TOrigin extends string> = RpcMessage & {
  origin: TOrigin
}

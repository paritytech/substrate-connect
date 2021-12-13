type EventHandler<T> = (message: MessageEvent<T>) => void

export interface ToWebpageHeader {
  origin: "content-script"
  providerId: number
}

export enum ToWebpageMessageType {
  Disconnect = "disconnect",
  Rpc = "rpc",
  Error = "error",
}

interface ToWebpageDisconnect {
  type: ToWebpageMessageType.Disconnect
}

interface ToWebpageRpc {
  type: ToWebpageMessageType.Rpc
  payload: string
}

interface ToWebpageError {
  type: ToWebpageMessageType.Error
  payload: string
}

export type ToWebpageBody = ToWebpageDisconnect | ToWebpageRpc | ToWebpageError

export type ToWebpage = {
  header: ToWebpageHeader
  body: ToWebpageBody
}

export const extension = {
  send: (message: ToWebpage): void => {
    window.postMessage(message, "*")
  },
  listen: (handler: EventHandler<ToExtension>): void => {
    window.addEventListener("message", handler)
  },
}

export interface ToExtensionHeader {
  origin: "extension-provider"
  providerId: number
}

export enum ToExtensionMessageType {
  Connect = "connect",
  Disconnect = "disconnect",
  Spec = "spec",
  Rpc = "rpc",
}

interface ToExtensionConnect {
  type: ToExtensionMessageType.Connect
  payload: {
    displayName: string
  }
}

interface ToExtensionDisconnect {
  type: ToExtensionMessageType.Disconnect
}

interface ToExtensionSpec {
  type: ToExtensionMessageType.Spec
  payload: {
    relaychain: string
    parachain?: string
  }
}

interface ToExtensionRpc {
  type: ToExtensionMessageType.Rpc
  payload: string
}

export type ToExtensionBody =
  | ToExtensionConnect
  | ToExtensionDisconnect
  | ToExtensionSpec
  | ToExtensionRpc

export type ToExtension = {
  header: ToExtensionHeader
  body: ToExtensionBody
}

export const provider = {
  send: (message: ToExtension): void => {
    window.postMessage(message, "*")
  },
  listen: (handler: EventHandler<ToWebpage>): void => {
    window.addEventListener("message", handler)
  },
}

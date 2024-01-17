import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { CONTEXT, RpcMessageWithOrigin } from "./shared"

type PostMessage<T> = {
  channelId: string
  msg: T
}

export type ToApplicationMessage = PostMessage<
  RpcMessageWithOrigin<typeof CONTEXT.CONTENT_SCRIPT> | ToApplication
>

export type ToExtensionMessage = PostMessage<
  RpcMessageWithOrigin<typeof CONTEXT.WEB_PAGE> | ToExtension
>

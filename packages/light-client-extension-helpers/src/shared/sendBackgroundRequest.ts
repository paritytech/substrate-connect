import {
  BackgroundRequest,
  BackgroundResponse,
  BackgroundResponseError,
} from "@/protocol"
import { CONTEXT } from "./constants"

export const sendBackgroundRequest = async <
  TRequest extends BackgroundRequest,
  TResponse extends BackgroundResponse & {
    type: `${TRequest["type"]}Response`
  },
>(
  msg: TRequest,
) => {
  // TResponse | BackgroundResponseError does not narrow
  const response: BackgroundResponse | BackgroundResponseError =
    await chrome.runtime.sendMessage(msg)
  if (response.origin !== CONTEXT.BACKGROUND) throw new Error("Unknown origin")
  if (response.type === "error") throw new Error(response.error)
  return response as TResponse
}

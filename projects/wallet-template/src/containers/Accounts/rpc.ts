import { createRpc } from "@substrate/light-client-extension-helpers/utils"
import { BackgroundRpcSpec } from "../../background/types"

const port = chrome.runtime.connect({
  name: "substrate-wallet-template/accounts",
})
export const rpc = createRpc((msg) =>
  port.postMessage(msg),
).withClient<BackgroundRpcSpec>()
port.onMessage.addListener(rpc.handle)

import type { InputChain } from "@substrate/light-client-extension-helpers/background"

export type ToContent = {
  origin: "my-extension-background"
  type: "onAddChainByUser"
  inputChain: InputChain
}

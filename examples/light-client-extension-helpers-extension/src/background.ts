import { register } from "@substrate/light-client-extension-helpers/background"
import { wellKnownChainSpecs } from "@substrate/light-client-extension-helpers/known-chain-specs"
import type { ToContent } from "./protocol"
import { smoldotClient } from "./background-smoldot.code-split"

const { lightClientPageHelper, addOnAddChainByUserListener } = register({
  smoldotClient,
  getWellKnownChainSpecs: async () =>
    Object.fromEntries(
      Object.entries(wellKnownChainSpecs)
        // FIXME: remove filter once https://github.com/smol-dot/smoldot/issues/1691 is fixed
        .filter(
          ([genesisHash]) =>
            genesisHash !==
            "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e",
        ),
    ),
})

addOnAddChainByUserListener(async (inputChain, tabId) => {
  if (
    !(await chrome.tabs.sendMessage(tabId, {
      origin: "my-extension-background",
      type: "onAddChainByUser",
      inputChain,
    } as ToContent))
  )
    throw new Error("addChainByUser rejected")

  await lightClientPageHelper.persistChain(
    inputChain.chainSpec,
    inputChain.relayChainGenesisHash,
  )
})

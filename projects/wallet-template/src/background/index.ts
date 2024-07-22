import {
  InputChain,
  register,
} from "@substrate/light-client-extension-helpers/background"
import { start } from "@substrate/light-client-extension-helpers/smoldot"
import { createBackgroundRpc } from "./createBackgroundRpc"
import * as storage from "./storage"
import type { Account } from "./types"
import { startHeartbeat } from "./heartbeat"

const { lightClientPageHelper, addOnAddChainByUserListener } = register({
  smoldotClient: start({ maxLogLevel: 4 }),
  getWellKnownChainSpecs: () =>
    // Note that this list doesn't necessarily always have to match the list of well-known
    // chains in `@substrate/connect`. The list of well-known chains is not part of the stability
    // guarantees of the connect <-> extension protocol and is thus allowed to change
    // between versions of the extension. For this reason, we don't use the `WellKnownChain`
    // enum from `@substrate/connect` but instead manually make the list in that enum match
    // the list present here.
    Promise.all(
      [
        "./chainspecs/polkadot.json",
        "./chainspecs/ksmcc3.json",
        "./chainspecs/westend2.json",
        "./chainspecs/paseo.json",
        // FIXME: remove comment once https://github.com/smol-dot/smoldot/issues/1691 is fixed
        // "./chainspecs/rococo_v2_2.json",
      ].map((path) =>
        fetch(chrome.runtime.getURL(path)).then((response) => response.text()),
      ),
    ),
})

const signRequests = {}

type BackgroundRpc = ReturnType<typeof createBackgroundRpc>
const connectedRpcs: BackgroundRpc[] = []
const notifyOnAccountsChanged = (accounts: Account[]) =>
  connectedRpcs.forEach((rpc) => rpc.notify("onAccountsChanged", [accounts]))
const subscribeOnAccountsChanged = (rpc: BackgroundRpc) => {
  connectedRpcs.push(rpc)
  return () => {
    connectedRpcs.splice(connectedRpcs.indexOf(rpc), 1)
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (!port.name.startsWith("substrate-wallet-template")) return
  const rpc = createBackgroundRpc((msg) => port.postMessage(msg))
  port.onMessage.addListener((msg) =>
    rpc.handle(msg, {
      lightClientPageHelper,
      signRequests,
      port,
      notifyOnAccountsChanged,
    }),
  )

  port.onDisconnect.addListener(subscribeOnAccountsChanged(rpc))
})

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const self = await chrome.management.getSelf()

  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const keystore = await storage.get("keystore")
    if (
      keystore ||
      // don't pop up a new tab in development so playwright can reliably
      // run tests on the extension
      self.installType === "development"
    )
      return
    chrome.tabs.create({
      url: chrome.runtime.getURL(`ui/assets/wallet-popup.html#/welcome`),
    })
  }
})

addOnAddChainByUserListener(async (inputChain) => {
  const isRelayChain = !inputChain.relayChainGenesisHash
  const existingChain = await lightClientPageHelper.getChain(
    inputChain.genesisHash,
  )
  if (isRelayChain && !existingChain) {
    await waitForAddChainApproval(inputChain)

    const persistedChain = await lightClientPageHelper.getChain(
      inputChain.genesisHash,
    )

    if (!persistedChain) {
      throw new Error("User rejected")
    }
  }
})

const waitForAddChainApproval = async (inputChain: InputChain) => {
  const window = await chrome.windows.create({
    focused: true,
    width: 400,
    height: 600,
    left: 150,
    top: 150,
    type: "popup",
    url: chrome.runtime.getURL(
      `ui/assets/wallet-popup.html#/add-chain-by-user?params=${encodeURIComponent(JSON.stringify(inputChain))}`,
    ),
  })
  const onWindowsRemoved = (windowId: number) => {
    if (windowId !== window.id) return
    resolveWindowClosed()
  }
  chrome.windows.onRemoved.addListener(onWindowsRemoved)

  const { promise: windowClosedPromise, resolve: resolveWindowClosed } =
    Promise.withResolvers<void>()

  await windowClosedPromise
}

startHeartbeat()

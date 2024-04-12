import { start } from "smoldot"
import { register } from "@substrate/light-client-extension-helpers/background"
import { createBackgroundRpc } from "./createBackgroundRpc"
import * as storage from "./storage"
import type { Account } from "./types"

const { lightClientPageHelper } = register({
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
        // FIXME: remove comment once https://github.com/smol-dot/smoldot/issues/1691 is fixed
        // "./chainspecs/rococo_v2_2.json",
      ].map((path) =>
        fetch(chrome.runtime.getURL(path)).then((response) => response.text()),
      ),
    ),
})

const signRequests = {}

const connectedRpcs: ReturnType<typeof createBackgroundRpc>[] = []
const notifyOnAccountsChanged = (accounts: Account[]) =>
  connectedRpcs.forEach((rpc) => rpc.notify("onAccountsChanged", [accounts]))

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
  connectedRpcs.push(rpc)
  port.onDisconnect.addListener(() =>
    connectedRpcs.splice(connectedRpcs.indexOf(rpc), 1),
  )
})

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const keystore = await storage.get("keystore")
    if (keystore) return
    chrome.tabs.create({
      url: chrome.runtime.getURL(`ui/assets/wallet-popup.html#/welcome`),
    })
  }
})

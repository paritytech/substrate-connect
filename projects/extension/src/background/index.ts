import { start } from "smoldot"
import { register } from "@polkadot-api/light-client-extension-helpers/background"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  DEV_MINI_SECRET,
  ss58Address,
  ss58PublicKey,
} from "@polkadot-labs/hdkd-helpers"
import { createRpc } from "../shared/createRpc"

register({
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
        "./chainspecs/rococo_v2_2.json",
      ].map((path) =>
        fetch(chrome.runtime.getURL(path)).then((response) => response.text()),
      ),
    ),
})

const aliceAccount = sr25519CreateDerive(DEV_MINI_SECRET)

const rpcHandlers = {
  async getAccounts(_network: string) {
    // TODO: use storage and get accounts for network and url?
    // const networkAccounts = getAccountsFor(network)
    console.log({ _network })

    const publicKey = aliceAccount("//polkadot").publicKey
    const networkAccounts = [
      {
        publicKey,
        displayName: "Alice",
        // FIXME: use network prefix
        ss58Address: ss58Address(publicKey),
        ss58PublicKey: ss58PublicKey(publicKey),
      },
    ]
    return networkAccounts
  },
  async createTx(network: string, from: string, callData: string) {
    // TODO: use getTxCreator from "@polkadot-api/tx-helper"
    // https://github.com/paritytech/polkadot-api/blob/2af5c4ffde4c2770c0a9c93750f6120630cbff23/experiments/src/tx.ts#L26-L80
    return `extrinsic for network:${network} from:${from} callData:${callData}`
  },
}

export type BackgroundRpcHandlers = typeof rpcHandlers

chrome.runtime.onConnect.addListener((port) => {
  // FIXME: extract into a constant
  if (port.name !== "account-management") return

  const server = createRpc((m) => port.postMessage(m), rpcHandlers)
  port.onMessage.addListener(server.handle)
})

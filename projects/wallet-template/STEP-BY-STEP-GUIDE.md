# Step by Step Guide

To add light client functionality to your dapp, follow this step by step guide.

## Requirements

- Manifest V3
- `["notifications", "storage", "tabs", "alarms"]` enabled in your manifest

## Setup

```sh
pnpm i @substrate/light-client-extension-helpers @substrate/connect-known-chains
```

## Steps

1. Add the light client background extension helper to your background script.
   The must be a service worker script using manifest v3.

   When your extension launches, it will immediately be connected to smoldot.

```json
// manifest-v3-chrome.json
"background": {
  "service_worker": "background/background.js",
  "type": "module"
},
```

```ts
// background-script.ts
import { polkadot, ksmcc3, westend2 } from "@substrate/connect-known-chains"
import { start } from "@substrate/light-client-extension-helpers/smoldot"

const { lightClientPageHelper, addOnAddChainByUserListener } = register({
  smoldotClient: start({ maxLogLevel: 4 }),
  getWellKnownChainSpecs: async () => [polkadot, ksmcc3, westend2],
})
```

2. Setup your background RPC client using the `substrate/light-client-extension-helpers/utils package.

Use the [createBackgroundRpc](./background/createBackgroundRpc.ts) file as a reference implementation.

```ts
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
```

1. In your content script, invoke the register function. and append your image.
   See the [content script](./content/index.ts) for exact
   implementation details.

```ts
import { register } from "@substrate/light-client-extension-helpers/content-script"
const CHANNEL_ID = "substrate-wallet-template"

try {
  const s = document.createElement("script")
  s.src = chrome.runtime.getURL("inpage/inpage.js")
  s.onload = () => s.remove()
  ;(document.head || document.documentElement).appendChild(s)
} catch (error) {
  console.error("error injecting inpage/inpage.js", error)
}

register(CHANNEL_ID)

const port = chrome.runtime.connect({ name: "substrate-wallet-template" })
port.onMessage.addListener((msg) =>
  // origin is needed to filter from other postMessages
  window.postMessage({ origin: "substrate-wallet-template/extension", msg }),
)
window.addEventListener("message", ({ data }) => {
  if (data.origin !== "substrate-wallet-template/web") return
  port.postMessage(data.msg)
})
```

1. In the inpage you injected with the content script, expose your provider
   with the `@substrate/discovery` protocol. See the [inpage script](./src/inpage/index.ts) for full implementation details.

```ts
const CHANNEL_ID = "substrate-wallet-template"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Wallet Template",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectWalletTemplate",
}

const provider = getLightClientProvider(CHANNEL_ID).then(
  (lightClientProvider) => ({
    ...lightClientProvider,
    async getAccounts(chainId: string) {
      return rpc.client.getAccounts(chainId)
    },
    async createTx(chainId: string, from: string, callData: string) {
      return rpc.client.createTx(chainId, from, callData)
    },
  }),
)

const detail: Unstable.SubstrateConnectProviderDetail = Object.freeze({
  kind: "substrate-connect-unstable",
  info: PROVIDER_INFO,
  provider,
})

window.addEventListener(
  "substrateDiscovery:requestProvider",
  ({ detail: { onProvider } }) => onProvider(detail),
)

window.dispatchEvent(
  new CustomEvent("substrateDiscovery:announceProvider", {
    detail,
  }),
)
```

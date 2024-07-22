# Step by Step Guide

To add light client functionality to your extension, follow this step-by-step
guide. This guide explains how to integrate smoldot and the light client
extension helpers into your browser extension.

## Requirements

- Manifest V3: This is required in both Chrome and Firefox because we need to use service workers to run [smoldot](https://github.com/smol-dot/smoldot). For more details, you can refer to the [Chrome Manifest V3 documentation](https://developer.chrome.com/docs/extensions/mv3/intro/) and the [Firefox Manifest V3 documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background).
- Ensure the following permissions are enabled in your manifest: `["notifications", "storage", "tabs", "alarms"]`.

## Setup

Install these two packages: `@substrate/light-client-extension-helpers` and `@substrate/connect-known-chains`. The former provides methods that instantly equip your extension with light client capabilities, while the latter contains all the well know chains that you need to provide in the background script `register` method.

```sh
pnpm i @substrate/light-client-extension-helpers @substrate/connect-known-chains
```

## Steps

### 1. Add Light Client Background Extension Helper

Add the light client background extension helper to your background script. This must be a service worker script using Manifest V3. When your extension launches, it will immediately connect to `smoldot`.

**Manifest V3 Configuration:**

```json
// manifest-v3-chrome.json
"background": {
  "service_worker": "background/background.js",
  "type": "module"
},
```

**Background Script:**

```ts
import {
  polkadot,
  ksmcc3,
  westend2,
  paseo,
} from "@substrate/connect-known-chains"
import { start } from "@substrate/light-client-extension-helpers/smoldot"

const { lightClientPageHelper, addOnAddChainByUserListener } = register({
  smoldotClient: start({ maxLogLevel: 4 }),
  getWellKnownChainSpecs: async () => [polkadot, ksmcc3, westend2, paseo],
})
```

### 2. Setup Background RPC Client

Use the `substrate/light-client-extension-helpers/utils` package to set up your background RPC client. Refer to the [createBackgroundRpc.ts](./background/createBackgroundRpc.ts) file for implementation details.

**Background RPC Client:**

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

### 3. Register Content Script

Invoke the register function in your content script and append your image. See the [content script](./content/index.ts) for detailed implementation.

**Content Script:**

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
  window.postMessage({ origin: "substrate-wallet-template/extension", msg }),
)
window.addEventListener("message", ({ data }) => {
  if (data.origin !== "substrate-wallet-template/web") return
  port.postMessage(data.msg)
})
```

### 4. Inject In-Page Script

In the in-page script injected by the content script, expose your provider using the `@substrate/discovery` protocol. Refer to the [in-page script](./src/inpage/index.ts) for full implementation details.

**In-Page Script:**

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

## Conclusion

Once your extension is properly set up, you can test it using the [light client dapp example](../../examples/light-client-dapp).

1. **Connect Account**:

   - Click on "Connect Account" in the dapp.
   - ![lc dapp step 1](./assets/img/lc-dapp-step-1.png)

2. **Verify Extension in Providers List**:

   - Ensure your extension is listed among the available providers.
   - ![lc dapp step 2](./assets/img/lc-dapp-step-2.png)

3. **Access Extension Options**:

   - Open the options page within your extension.
   - ![lc dapp step 3](./assets/img/lc-dapp-step-3.png)

4. **Check Smoldot Logs**:
   - In your extension console (not the webpage console), verify that smoldot logs are being printed.
   - ![lc dapp step 4](./assets/img/lc-dapp-step-4.png)

If you successfully complete these steps, your extension setup is finalized.

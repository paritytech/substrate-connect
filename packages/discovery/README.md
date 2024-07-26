<br /><br />

<div align="center">
  <h1 align="center">@substrate/discovery</h1>
  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/discovery">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/discovery" />
    </a>
    <a href="https://github.com/paritytech/substrate-connect/blob/master/LICENSE">
      <img alt="GPL-3.0-or-later" src="https://img.shields.io/npm/l/@substrate/discovery" />
    </a>
  </p>
</div>

<br /><br />

This package implements the discovery protocol that browsers use to find compliant browser extensions. It introduces a set of window `CustomEvent`s to provide a two-way communication protocol between Polkadot Wallet Provider libraries and injected scripts provided by browser extensions.

## Main Export

The main export is a function called `getProviders`. This function dispatches an event on the window object that compliant browser extensions (or similar) may respond to by providing back an interface of the correct shape. An array of all such interfaces that we get back will be given back to the caller of `getProviders`.

## How It Works

The discovery protocol is quite simple and can be implemented in these steps:

1. The extension injects an inpage script that registers a listener for the `substrateDiscovery:requestProvider` event.
2. The listener announces the provider by invoking the `onProvider` callback from the event payload synchronously.
3. Optionally, the script can dispatch the `substrateDiscovery:announceProvider` event with the provider details when the script is loaded.

Refer to `src/index.ts` in this package for an implementation of this protocol.

## Basic Usage Example

```ts
import { getProviders } from "@substrate/discovery"

const providers = getProviders()
const firstProvider = providers.length > 0 ? providers[0].provider : null

console.log(firstProvider)
```

## Example with rDNS Filter

This example demonstrates how to filter providers based on a specific rDNS value. This approach is useful when you need to target specific extensions rather than all extensions matching a certain interface.

```ts
import { getProviders } from "@substrate/discovery"

const provider = getProviders()
  .filter((detail) =>
    detail.info.rdns.startsWith("io.github.paritytech.SubstrateConnect"),
  )
  .map((detail) => detail.provider)[0]

console.log(provider)
```

## React Example

```tsx
import React, { useEffect, useState } from "react"
import { getProviders } from "@substrate/discovery"

const SmoldotProviderComponent = () => {
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    const providers = getProviders()
    if (providers.length > 0) {
      setProvider(providers[0].provider)
    }
  }, [])

  return (
    <div>
      {provider ? <p>Provider: {provider}</p> : <p>Loading provider...</p>}
    </div>
  )
}

export default SmoldotProviderComponent
```

## Extension Example

```ts
import { getLightClientProvider } from "@substrate/light-client-extension-helpers/web-page"

const rpc = createRpc(
  (msg: any) =>
    window.postMessage({ msg, origin: "substrate-wallet-template/web" }),
  handlers,
).withClient<BackgroundRpcSpec>()
window.addEventListener("message", ({ data }) => {
  if (data?.origin !== "substrate-wallet-template/extension") return
  rpc.handle(data.msg, undefined)
})

const provider = await getLightClientProvider(CHANNEL_ID).then(
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

## Notes

- The `detail.provider` can be a promise, depending on the library implementation which allows announcing provider details while the provider is being initialized.
- The `substrateDiscovery:requestProvider` event payload uses an `onProvider` callback to respond with the provider details synchronously to the DApp, allowing to get all the providers without needing to wait for any macrotasks (e.g., `setTimeout`), microtasks, or any arbitrary time to listen to an event (e.g., `substrateDiscovery:announceProvider`).

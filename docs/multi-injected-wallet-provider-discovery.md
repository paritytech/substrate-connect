# Multi Injected Wallet Provider Discovery

This is a proposal that uses window [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)s to announce injected Polkadot Wallet Providers.

Based on [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963), it's an alternative discovery mechanism to [`window.injectedWeb3`](https://github.com/polkadot-js/extension?tab=readme-ov-file#injection-information) for PolkadotJS wallet providers.

The discovery is achieved by introducing a set of windows events to provide a two-way commnunication protocol between Polkadot Wallet Provider libraries and injected scripts providerd by browser extensions.

## How it works?

The exension [injects](/projects/wallet-template/src/content/index.ts#L4) an [inpage](/projects/wallet-template/src/inpage/index.ts#L55) script that

- registers a listener for the `unstableWallet:requestProvider` event and anounces the provider by invoking synchronously the `onProvider` callback from the event payload
- optionally, dispatches the `unstableWallet:announceProvider` event with the provider details when the script is loaded

For example:

```ts
const detail = Object.freeze({
  info: {
    uuid: crypto.randomUUID(),
    name: "Substrate Connect Light Client",
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
    rdns: "io.github.paritytech.SubstrateConnectLightClient",
  },
  provider: getProvider(), // getProvider returns a Promise<Provider>
})

window.addEventListener(
  "unstableWallet:requestProvider",
  ({ detail: { onProvider } }) => onProvider(detail),
)

window.dispatchEvent(
  new CustomEvent("unstableWallet:announceProvider", {
    detail,
  }),
)
```

Note:

- the `detail.provider` is a promise, this allows to announce the provider details while the provider is being initialized
- the `unstableWallet:requestProvider` event payload uses an `onProvider` callback to respond with the provider details synchronously to the DApp, this allows to get all the providers without needing to wait for any macrotasks (e.g. `setTimeout`), or microtasks to complete, or any arbitrary time to listen to an event (e.g. `unstableWallet:announceProvider`).

Then, the DApp

- dispatches the `unstableWallet:requestProvider` and stores the announced provider details
- optionally, registers a listener for the `unstableWallet:announceProvider` event and stores announced providers details

For example, all the available providers could be discovered with

```ts
export const getProviders = () => {
  const providers = []
  window.dispatchEvent(
    new CustomEvent("unstableWallet:requestProvider", {
      detail: {
        onProvider(detail) {
          providers.push(detail)
        },
      },
    }),
  )
  return providers
}
```

Note:

- the event types and payloads are documented in [`packages/unstable-wallet-provider/UnstableWalletProviderDiscovery.d.ts`](/packages/unstable-wallet-provider/UnstableWalletProviderDiscovery.d.ts)
- the `unstableWallet:` event namespace should be changed to a better name

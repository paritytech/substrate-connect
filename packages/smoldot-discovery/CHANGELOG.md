# @substrate/smoldot-discovery

## 1.0.0

### Major Changes

- 4123a5e: ## Breaking Changes

  ### Change Summary

  - Removes the connector function and extracts its into a different package.
  - Remove `@substrate/light-client-extension-helpers` dependency.
  - Re-export `@substrate/discovery` types

  ### Motivation

  `@substrate/smoldot-discovery` is intended for dapp consumption only. However by having a connector function that was used by extensions, we forced dapps to have a dependency on `@substrate/light-client-extension-helpers`. This is unacceptable since `@substrate/light-client-extension-helpers` should be used by extensions only. As a result, the connector function has been extracted into a separate package
  and the dependency on `substrate/light-client-extension-helpers` has been removed.

  ### How to Update

  #### Dapps

  No code changes are required. Simply update the package and remove the `@substrate/light-client-extension-helpers` peer dependency.

  #### Extensions

  Extensions must install the `@substrate/smoldot-discovery-connector` package.

  Then the connector can be consumed as follows:

  ```ts
  import { getLightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
  import {
    make as makeSmoldotDiscoveryConnector,
    SmoldotExtensionProviderDetail,
  } from "@substrate/smoldot-discovery-connector"

  const CHANNEL_ID = "YOUR_CHANNEL_ID"

  const lightClientProvider = getLightClientProvider(CHANNEL_ID)

  // #region Smoldot Discovery Provider
  {
    const provider = lightClientProvider.then(makeSmoldotDiscoveryConnector)

    const detail: SmoldotExtensionProviderDetail = Object.freeze({
      kind: "smoldot-v1",
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
  }
  // #endregion
  ```

  ### Additional Notes

  - The connector `make` function now accepts two parameters instead of one. The `lightClientProvider` is now the first parameter.

### Minor Changes

- e35a0e8: add paseo testnet

### Patch Changes

- cef7d50: update chainspecs

## 0.0.9

### Patch Changes

- 444503f: chore: update READMEs across repo

## 0.0.8

### Patch Changes

- c358405: fix(smoldot-discovery): peer dependencies constraint
- bdd728d: fix: re-export missing types from light client ext helpers webpage

## 0.0.7

### Patch Changes

- 78ca884: chore: add smoldot discovery connector

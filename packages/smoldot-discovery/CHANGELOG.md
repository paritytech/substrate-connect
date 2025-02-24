# @substrate/smoldot-discovery

## 2.0.2

### Patch Changes

- 92316c0: chore(deps-dev): bump vitest in the npm_and_yarn group

  Bumps the npm_and_yarn group with 1 update: [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest).

  Updates `vitest` from 2.1.4 to 2.1.9

  - [Release notes](https://github.com/vitest-dev/vitest/releases)
  - [Commits](https://github.com/vitest-dev/vitest/commits/v2.1.9/packages/vitest)

  ***

  updated-dependencies:

  - dependency-name: vitest
    dependency-type: direct:development
    dependency-group: npm_and_yarn
    ...

  Signed-off-by: dependabot[bot] <support@github.com>

- Updated dependencies [92316c0]
  - @substrate/discovery@0.2.2

## 2.0.1

### Patch Changes

- 09f1c22: chore(deps-dev): bump vitest from 2.0.5 to 2.1.4

  Bumps [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest) from 2.0.5 to 2.1.4.

  - [Release notes](https://github.com/vitest-dev/vitest/releases)
  - [Commits](https://github.com/vitest-dev/vitest/commits/v2.1.4/packages/vitest)

  ***

  updated-dependencies:

  - dependency-name: vitest
    dependency-type: direct:development
    update-type: version-update:semver-minor
    ...

  Signed-off-by: dependabot[bot] <support@github.com>

- Updated dependencies [09f1c22]
  - @substrate/discovery@0.2.1

## 2.0.0

### Major Changes

- e2a5cef: ## Breaking Changes

  - Modified `addChain` and `addWellKnownChain` methods:
    - Now accept a single `options` object parameter instead of separate `jsonRpcCallback` and `databaseContent` parameters
    - The `jsonRpcCallback` is now passed as `options.jsonRpcCallback`
    - The `databaseContent` is now passed as `options.databaseContent`
  - Removed `JsonRpcCallback` type export. Use the callback type from the `options` parameter of `addChain` and `addWellKnownChain` instead.
  - Updated peer dependency for `@substrate/smoldot-discovery` to "^2"

  ## New Features

  - Added new methods to the Chain interface to conform with smoldot's interface:
    - `nextJsonRpcResponse`: Returns a promise that resolves with the next JSON-RPC response
    - `jsonRpcResponses`: Returns an async iterable of JSON-RPC responses

  ## Other Changes

  - Updated internal implementation to use Effect for streaming JSON RPC responses in a Queue.
  - Updated error handling to include `QueueFullError`.

  ## Migration Guide

  Users of this package will need to update their code to use the new method signatures for `addChain` and `addWellKnownChain`, and adapt to the removed `JsonRpcCallback` type export. Please refer to the updated documentation for the new usage patterns.

  When upgrading, ensure you're using version 3 or higher of `@substrate/smoldot-discovery` as a peer dependency.

## 1.2.0

### Minor Changes

- 198b375: chore: catalog and upgrade papi dependencies

### Patch Changes

- Updated dependencies [198b375]
  - @substrate/discovery@0.2.0

## 1.1.0

### Minor Changes

- b476e7e: update build system to tshy

### Patch Changes

- Updated dependencies [b476e7e]
  - @substrate/discovery@0.1.0

## 1.0.1

### Patch Changes

- e8fef4e: update docs
- 0ce9864: simplify isSmoldotExtension
- Updated dependencies [e8fef4e]
  - @substrate/discovery@0.0.2

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

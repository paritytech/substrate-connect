# Changelog

## 2.1.6

### Patch Changes

- Updated dependencies [543b163]
- Updated dependencies [3cc9e6d]
  - @substrate/connect-known-chains@1.10.0

## 2.1.5

### Patch Changes

- Updated dependencies [ae70d90]
  - @substrate/connect-known-chains@1.9.3

## 2.1.4

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
- Updated dependencies [e29f033]
  - @substrate/connect-extension-protocol@2.2.2
  - @substrate/connect-known-chains@1.9.2
  - @substrate/smoldot-discovery@2.0.2

## 2.1.3

### Patch Changes

- Updated dependencies [8b9cb46]
  - @substrate/connect-known-chains@1.9.1

## 2.1.2

### Patch Changes

- Updated dependencies [654165c]
  - @substrate/connect-known-chains@1.9.0

## 2.1.1

### Patch Changes

- Updated dependencies [37910d7]
  - @substrate/connect-known-chains@1.8.1

## 2.1.0

### Minor Changes

- ff20390: chore: update chainspecs
- f6cef04: chore: update changesets

### Patch Changes

- 7ee9c18: chore: update smoldot to 2.0.34
- 20eea99: chore: update smoldot
- Updated dependencies [ff20390]
- Updated dependencies [f6cef04]
  - @substrate/connect-known-chains@1.8.0

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
- Updated dependencies [9107ccc]
  - @substrate/connect-extension-protocol@2.2.1
  - @substrate/connect-known-chains@1.7.0
  - @substrate/smoldot-discovery@2.0.1

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

### Patch Changes

- Updated dependencies [e2a5cef]
  - @substrate/smoldot-discovery@2.0.0

## 1.3.1

### Patch Changes

- Updated dependencies [a1a7412]
  - @substrate/connect-known-chains@1.6.0

## 1.3.0

### Minor Changes

- 198b375: chore: catalog and upgrade papi dependencies

### Patch Changes

- Updated dependencies [f2163cb]
- Updated dependencies [198b375]
- Updated dependencies [0de443d]
  - @substrate/connect-known-chains@1.5.0
  - @substrate/connect-extension-protocol@2.2.0
  - @substrate/smoldot-discovery@1.2.0

## 1.2.1

### Patch Changes

- d0316d7: update docs
- Updated dependencies [972af65]
- Updated dependencies [b2c7737]
  - @substrate/connect-known-chains@1.4.1

## 1.2.0

### Minor Changes

- b476e7e: update build system to tshy
  worker is now exported under "browser" conditional export instead of node. "node" conditional export removed.

### Patch Changes

- Updated dependencies [6014927]
- Updated dependencies [b476e7e]
  - @substrate/connect-known-chains@1.4.0
  - @substrate/connect-extension-protocol@2.1.0
  - @substrate/smoldot-discovery@1.1.0

## 1.1.3

### Patch Changes

- Updated dependencies [0bd81c2]
- Updated dependencies [076439e]
- Updated dependencies [bc9fe42]
  - @substrate/connect-known-chains@1.3.0

## 1.1.2

### Patch Changes

- 0b3053e: chore(deps-dev): bump vitest from 1.6.0 to 2.0.5

  Bumps [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest) from 1.6.0 to 2.0.5.

  - [Release notes](https://github.com/vitest-dev/vitest/releases)
  - [Commits](https://github.com/vitest-dev/vitest/commits/v2.0.5/packages/vitest)

  ***

  updated-dependencies:

  - dependency-name: vitest
    dependency-type: direct:development
    update-type: version-update:semver-major
    ...

  Signed-off-by: dependabot[bot] <support@github.com>

- Updated dependencies [1049be1]
  - @substrate/connect-known-chains@1.2.2

## 1.1.1

### Patch Changes

- 80187a0: docs(substrate-connect): add polkadotjs example
- e8fef4e: update docs
- Updated dependencies [897f553]
- Updated dependencies [e8fef4e]
- Updated dependencies [0ce9864]
- Updated dependencies [4a45295]
- Updated dependencies [4a45295]
  - @substrate/connect-known-chains@1.2.1
  - @substrate/smoldot-discovery@1.0.1

## 1.1.0

### Minor Changes

- e35a0e8: add paseo testnet

### Patch Changes

- cef7d50: update chainspecs
- Updated dependencies [e35a0e8]
- Updated dependencies [cef7d50]
- Updated dependencies [188bf5b]
- Updated dependencies [4123a5e]
  - @substrate/connect-known-chains@1.2.0
  - @substrate/smoldot-discovery@1.0.0

## 1.0.9

### Patch Changes

- Updated dependencies [3efab80]
  - @substrate/connect-known-chains@1.1.11

## 1.0.8

### Patch Changes

- 444503f: chore: update READMEs across repo
- Updated dependencies [444503f]
- Updated dependencies [f03e960]
  - @substrate/smoldot-discovery@0.0.9
  - @substrate/connect-known-chains@1.1.10

## 1.0.7

### Patch Changes

- Updated dependencies [c358405]
- Updated dependencies [bdd728d]
  - @substrate/smoldot-discovery@0.0.8

## 1.0.6

### Patch Changes

- Updated dependencies [78ca884]
  - @substrate/smoldot-discovery@0.0.7

## 1.0.5

### Patch Changes

- 796c168: chore: update polkadot-api packages
- Updated dependencies [c69adf0]
  - @substrate/connect-known-chains@1.1.9

## 1.0.4 - 2024-07-02

### Patch Changes

- Updated dependencies [932dc47]
  - @substrate/connect-known-chains@1.1.8

### Changed

## 1.0.3 - 2024-06-27

- Update internal usage of discovery protocol to use @substrate/smoldot-discovery instead of @substrate/connect-discovery
- Bump light client extension helpers

## 1.0.2 - 2024-06-17

- Bump light client extension helpers

## 1.0.1 - 2024-06-17

- Version bump

## 1.0.0 - 2024-07-26

### Breaking

- Drop support for `lightClient:requestProvider` events [#2221](https://github.com/paritytech/substrate-connect/pull/2221)

### Changed

- Add support for @substrate/discovery protocol [#2221](https://github.com/paritytech/substrate-connect/pull/2221)

## 0.8.11 - 2024-05-24

- Update `@substrate/light-client-extension-helpers` to v0.1.0
- Update `@substrate/connect-known-chains` to v1.1.5

### Changed

## 0.8.10 - 2024-04-12

- Update `@substrate/light-client-extension-helpers` to v0.0.5
- Update `@substrate/connect-known-chains` to v1.1.4

## 0.8.9 - 2024-04-10

### Changed

- Update @polkadot-api/json-rpc-provider-proxy to v0.0.1 [#2072](https://github.com/paritytech/substrate-connect/pull/2072)
- Update @polkadot-api/substrate-client to v0.0.1 [#2072](https://github.com/paritytech/substrate-connect/pull/2072)

## 0.8.8 - 2024-03-12

### Changed

- Update smoldot@[version 2.0.22](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2022---2024-03-04) [#1936](https://github.com/paritytech/substrate-connect/pull/1936)
- Update `@substrate/light-client-extension-helpers` to v0.0.4 [#1971](https://github.com/paritytech/substrate-connect/pull/1971)

## 0.8.7 - 2024-02-23

### Changed

- Update `@substrate/light-client-extension-helpers` to v0.0.3 [#1875](https://github.com/paritytech/substrate-connect/pull/1875)

## 0.8.6 - 2024-02-21

### Changed

- Update smoldot@[version 2.0.21](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2021---2024-02-06) [#1843](https://github.com/paritytech/substrate-connect/pull/1843)
- Use LightClient provider announced by the extension with custom events [#1845](https://github.com/paritytech/substrate-connect/pull/1845)

## 0.8.5 - 2024-01-18

### Changed

- Use `@substrate/light-client-extension-helpers` ([#1720](https://github.com/paritytech/substrate-connect/pull/1720))
- Update smoldot@[version 2.0.17](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2017---2024-01-17) [#1767](https://github.com/paritytech/substrate-connect/pull/1767)

## 0.8.4 - 2024-01-02

### Changed

- Update smoldot@[version 2.0.16](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2016---2023-12-29) [#1708](https://github.com/paritytech/substrate-connect/pull/1708)
- Use `@polkadot-api/light-client-extension-helpers@0.0.1-4bc9bd71f8f37f800fec7a42775f403271903870.1.0` ([#1709](https://github.com/paritytech/substrate-connect/pull/1709))

## 0.8.3 - 2023-12-07

### Changed

- Use `@polkadot-api/light-client-extension-helpers/web-page` ([#1603](https://github.com/paritytech/substrate-connect/pull/1603))

## 0.8.2 - 2023-12-06

### Changed

- Update `@substrate/connect-known-chains@^1.0.2`

## 0.8.1 - 2023-11-30

### Changed

- Use chain specifications from `@substrate/connect-known-chains` ([#1647](https://github.com/paritytech/substrate-connect/pull/1647))

## 0.8.0 - 2023-11-28

### Breaking

- Add `chain.addChain(...)` to substrate connect API ([#1604](https://github.com/paritytech/substrate-connect/pull/1604))

### Changed

- Update smoldot@[version 2.0.13](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2013---2023-11-28) ([#1641](https://github.com/paritytech/substrate-connect/pull/1641))

## 0.7.35 - 2023-11-12

### Changed

- Update smoldot@[version 2.0.7](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#207---2023-11-02)[#1602](https://github.com/paritytech/substrate-connect/pull/1602)
- Fix code-spliting issue ([#1605](https://github.com/paritytech/substrate-connect/pull/1605))
- Update dependencies ([#1606](https://github.com/paritytech/substrate-connect/pull/1606))

## 0.7.34 - 2023-10-18

### Changed

- Update smoldot@[version 2.0.6](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#201---2023-09-08)[#1572](https://github.com/paritytech/substrate-connect/pull/1572)

## 0.7.33 - 2023-09-26

### Changed

- Use dynamic imports for well known chain ([#1560](https://github.com/paritytech/substrate-connect/pull/1560))

## 0.7.32 - 2023-09-14

### Changed

- Add `@substrate/connect/worker` ([#1525](https://github.com/paritytech/substrate-connect/pull/1525))
- Update smoldot@[version 2.0.1](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#201---2023-09-08)[#1534](https://github.com/paritytech/substrate-connect/pull/1534)

## 0.7.31 - 2023-07-25

### Changed

- Update smoldot@[version 1.0.13](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#1013---2023-07-16)[#1493](https://github.com/paritytech/substrate-connect/pull/1493)

## 0.7.30 - 2023-07-10

### Changed

- Update smoldot@[version 1.0.11](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#1011---2023-06-25)[#1463](https://github.com/paritytech/substrate-connect/pull/1463)

## 0.7.28 - 2023-06-11

### Fixed

- Publish `src` folder.

## 0.7.27 - 2023-06-11

### Changed

- Update smoldot@[version 1.0.9](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md)[#1438](https://github.com/paritytech/substrate-connect/pull/1438)

### Fixed

- Avoid importing json files ([#1437](https://github.com/paritytech/substrate-connect/pull/1437))

## 0.7.26 - 2023-05-04

### Changed

- Update smoldot@[version 1.0.4](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#104---2023-05-03)[#1429](https://github.com/paritytech/substrate-connect/pull/1429)

## 0.7.25 - 2023-05-01

### Changed

- Update smoldot@[version 1.0.3](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#102---2023-04-12) [#1426](https://github.com/paritytech/substrate-connect/pull/1426)

## 0.7.24 - 2023-04-20

### Changed

- Update smoldot@[version 1.0.2](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#102---2023-04-12)[#1420](https://github.com/paritytech/substrate-connect/pull/1420)
- Switch Rococo bootnodes from WS to WSS([#1418](https://github.com/paritytech/substrate-connect/pull/1418))
- Switch to DNS name based bootnodes for Rococo ([#1413](https://github.com/paritytech/substrate-connect/pull/1413))

### Fixed

- Fix broken link in docs ([#1417](https://github.com/paritytech/substrate-connect/pull/1417))

## 0.7.23 - 2023-04-04

### Changed

- Update smoldot@[version 1.0.1](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#101---2023-03-29)[#1410](https://github.com/paritytech/substrate-connect/pull/1410)

## 0.7.22 - 2023-03-21

### Changed

- Stop using dynamic imports in order to import the "well-known" specs, due to the fact that not all bundlers are able to handle dynamic imports gracefully on package's code.

## 0.7.21 - 2023-03-16

- Update smoldot to [version 1.0.0](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#100---2022-03-12). ([#1394](https://github.com/paritytech/substrate-connect/pull/1394))

## 0.7.20 - 2023-02-17

- Update @substrate/smoldot-light to smoldot@[version 0.7.11](https://github.com/smol-dot/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0711---2022-02-13). ([#1389](https://github.com/paritytech/substrate-connect/pull/1389))

## 0.7.19 - 2023-01-13

- Update checkpoints in chain specification, in order to correct the breaking of substrate-connect that occurred due to an operational issue on the Westend validators(execution of a sudo initializer.forceApprove operation at block #14192316 to recover consensus). ([#1377](https://github.com/paritytech/substrate-connect/pull/1377))

## 0.7.18 - 2022-12-13

### Changed

- Update @substrate/smoldot-light to [version 0.7.9](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#079---2022-11-28). ([#1361](https://github.com/paritytech/substrate-connect/pull/1361))

## 0.7.17 - 2022-11-18

### Changed

- Update @substrate/smoldot-light to [version 0.7.7](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#077---2022-11-11). ([#1345](https://github.com/paritytech/substrate-connect/pull/1345))

## 0.7.16 - 2022-10-31

### Changed

- Update @substrate/smoldot-light to [version 0.7.5](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#075---2022-10-31). ([#1331](https://github.com/paritytech/substrate-connect/pull/1331))

## 0.7.15 - 2022-10-17

### Changed

- Update @substrate/smoldot-light to [version 0.7.2](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#072---2022-10-12). ([#1300](https://github.com/paritytech/substrate-connect/pull/1300))

## 0.7.14 - 2022-09-21

### Changed

- Update @substrate/smoldot-light to [version 0.6.34](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0634---2022-09-20). ([#1261](https://github.com/paritytech/substrate-connect/pull/1261))

## 0.7.13 - 2022-09-14

### Changed

- Update @substrate/smoldot-light to [version 0.6.33](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0633---2022-09-13). ([#1248](https://github.com/paritytech/substrate-connect/pull/1248))

## 0.7.12 - 2022-09-12

### Changed

- Update @substrate/smoldot-light to [version 0.6.32](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0632---2022-09-07). ([#1244](https://github.com/paritytech/substrate-connect/pull/1244))

## 0.7.11 - 2022-08-18

### Changed

- Update @substrate/smoldot-light to [version 0.6.30](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0630---2022-08-12). ([#1213](https://github.com/paritytech/substrate-connect/pull/1213))

## 0.7.10 - 2022-08-01

### Changed

- Update @substrate/smoldot-light to [version 0.6.27](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0627---2022-07-29). ([#1182](https://github.com/paritytech/substrate-connect/pull/1182))

## 0.7.9 - 2022-07-19

### Changed

- Alter configuration for supporting both ESM and CommonJS (CJS) ([#1160](https://github.com/paritytech/substrate-connect/pull/1160))
- Update @substrate/smoldot-light to [version 0.6.25](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0625---2022-07-18). ([#1160](https://github.com/paritytech/substrate-connect/pull/1160))

## 0.7.8 - 2022-07-11

### Changed

- Update @substrate/smoldot-light to [version 0.6.23](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0623---2022-07-11). ([#1146](https://github.com/paritytech/substrate-connect/pull/1146))

## 0.7.7 - 2022-06-17

### Changed

- Update the Rococo chain specification to start after a forced authorities change. ([#1107](https://github.com/paritytech/substrate-connect/pull/1107))

## 0.7.6 - 2022-06-16

### Changed

- Update @substrate/smoldot-light to [version 0.6.19](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0619---2022-06-14). ([#1101](https://github.com/paritytech/substrate-connect/pull/1101))

### Fixed

- Fixed race condition causing failure to detect when the chain initialization fails when the extension is present ([#1093](https://github.com/paritytech/substrate-connect/pull/1093)).

## 0.7.5 - 2022-05-17

### Added

- Added an optional configuration to `createScClient` that allows forcing the use of the embedded client, and customizing the maximum log level to use while the embedded client client is in use, allowing for better debuggability. ([#1027](https://github.com/paritytech/substrate-connect/pull/1027), [#1044](https://github.com/paritytech/substrate-connect/pull/1044))

### Changed

- Update @substrate/smoldot-light to [version 0.6.16](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0616---2022-05-16) ([#1048](https://github.com/paritytech/substrate-connect/pull/1048))

## 0.7.4 - 2022-05-05

### Changed

- Debug logs are no longer printed in the console. This should considerably decrease the number of messages being printed. ([#1027](https://github.com/paritytech/substrate-connect/pull/1027))

## 0.7.3 - 2022-05-02

### Changed

- Replace the `rococo_v2_1` well-known chain with `rococo_v2_2` ([#1010](https://github.com/paritytech/substrate-connect/pull/1010))
- The reason why the extension rejects a chain is now explained in the exception being thrown. ([#968](https://github.com/paritytech/substrate-connect/pull/968))

## 0.7.2 - 2022-04-07

### Changed

- Update @substrate/smoldot-light to [version 0.6.15](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0615---2022-04-07) ([#955](https://github.com/paritytech/substrate-connect/pull/955))

## 0.7.0 - 2022-04-06

### Breaking

- Removed `createPolkadotJsScClient` from the API, as the `ScProvider` has been upstreamed to `@polkadot/rpc-provider`. ([#909](https://github.com/paritytech/substrate-connect/pull/909))

### Fixed

- Fixed an issue when calling `chain.remove()` where it would throw an `AlreadyDestroyedError`.

### Changed

- Update @substrate/smoldot-light to [version 0.6.13](https://github.com/paritytech/smoldot/blob/315c3683d3beee1c8f5884261f761530ddf7ef53/bin/wasm-node/CHANGELOG.md#0613---2022-04-05) ([#919](https://github.com/paritytech/substrate-connect/pull/919))
- The smoldot background worker will now bound its CPU usage to 50% of one CPU on average. ([#900](https://github.com/paritytech/substrate-connect/pull/900))

## 0.6.4, 0.6.5 - 2022-03-25

### Changed

- Update @substrate/smoldot-light to [version 0.6.9](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#069---2022-03-25) ([#901](https://github.com/paritytech/substrate-connect/pull/901))

## 0.6.3 - 2022-03-23

### Added

- The `isExtensionPresent` constant indicates whether the substrate-connect extension has been detected. ([#869](https://github.com/paritytech/substrate-connect/pull/869))

### Changed

- Update @substrate/smoldot-light to [version 0.6.8](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#068---2022-03-23) ([#890](https://github.com/paritytech/substrate-connect/pull/890))
- Replace the `rococo_v2` well-known chain with `rococo_v2_1` ([#879](https://github.com/paritytech/substrate-connect/pull/879))
- The inline client ("SmoldotProvider") no longer tries to connect to non-WebSocket addresses. This was previously the case when using the library from within NodeJS. This change ensures consistency in terms of blockchain connectivity between browsers and NodeJS. ([#863](https://github.com/paritytech/substrate-connect/pull/863))
- The error message when passing an invalid well-known chain name to `addWellKnownChain` is no longer confusing. ([#873](https://github.com/paritytech/substrate-connect/pull/873))

### Fixed

- Fixed wrong unsubscription JSON-RPC methods being used when calling `ProviderInterface.disconnect()` ([#842](https://github.com/paritytech/substrate-connect/pull/842)).

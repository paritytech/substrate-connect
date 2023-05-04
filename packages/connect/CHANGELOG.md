# Changelog

## [Unreleased]

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

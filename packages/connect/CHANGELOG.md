# Changelog

## [Unreleased]

## 0.7.9 - 2022-07-19

- Alter configuration for supporting both ESM and CommonJS (CJS) ([#1160](https://github.com/paritytech/substrate-connect/pull/1160))
- Update @substrate/smoldot-light to [version 0.6.25](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0625---2022-07-18). ([#2520](https://github.com/paritytech/smoldot/pull/2520))

## 0.7.8 - 2022-07-11

### Changed

- Update @substrate/smoldot-light to [version 0.6.23](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0623---2022-07-11). ([#2493](https://github.com/paritytech/smoldot/pull/2493))

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

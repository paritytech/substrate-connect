# Changelog

## [Unreleased]

### Fixed

- Fixed an issue when calling `chain.remove()` where it would throw an `AlreadyDestroyedError`.

### Changed

- Update @substrate/smoldot-light to [version 0.6.9](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#069---2022-03-25) ([#901](https://github.com/paritytech/substrate-connect/pull/901))

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

# Changelog

## [Unreleased]

## 0.1.6 - 2022-06-17

### Fixed

- Fix errors appearing in the logs about calling `chainHead_unstable_unpin` with `null` as parameter. ([#1112](https://github.com/paritytech/substrate-connect/pull/1112))

## 0.1.5 - 2022-06-16

### Changed

- Improve the UI of the popup and options page. ([#1075](https://github.com/paritytech/substrate-connect/pull/1075))
- Update @substrate/smoldot-light to [version 0.6.19](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0619---2022-06-14). ([#1101](https://github.com/paritytech/substrate-connect/pull/1101))

## 0.1.4 - 2022-05-23

### Fixed

- Fix a bug that was not saving the database content of each chain in the extension's localStorage upon first initialization of the extension. Also added an `await` from `async addWellKnownChain` that was missing. ([#1025](https://github.com/paritytech/substrate-connect/pull/1025))

### Changed

- Improve the UI of the popup and options page. ([#1039](https://github.com/paritytech/substrate-connect/pull/1039), [#1061](https://github.com/paritytech/substrate-connect/pull/1061))
- Update @substrate/smoldot-light to [version 0.6.16](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0616---2022-05-16). ([#1048](https://github.com/paritytech/substrate-connect/pull/1048))
- Replace the `rococo_v2_1` well-known chain with `rococo_v2_2`. ([#1010](https://github.com/paritytech/substrate-connect/pull/1010))

## 0.1.3 - 2022-04-11

### Changed

- Update @substrate/smoldot-light to [version 0.6.15](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0615---2022-04-07) ([#955](https://github.com/paritytech/substrate-connect/pull/955))

## 0.1.2 - 2022-04-06

### Added

- Replace the `rococo_v2` well-known chain with `rococo_v2_1`. Note that this does not break `@substrate/connect`, as it automatically falls back to downloading chain specifications if `rococo_v2` is requested. ([#879](https://github.com/paritytech/substrate-connect/pull/879))
- Add a new tab in the options showing the logs of the underlying client (#429](https://github.com/paritytech/substrate-connect/issues/429))

### Changed

- Update @substrate/smoldot-light to [version 0.6.13](https://github.com/paritytech/smoldot/blob/315c3683d3beee1c8f5884261f761530ddf7ef53/bin/wasm-node/CHANGELOG.md#0613---2022-04-05) ([#919](https://github.com/paritytech/substrate-connect/pull/919))
- The smoldot background worker will now bound its CPU usage to 50% of one CPU on average. ([#900](https://github.com/paritytech/substrate-connect/pull/900))

### Fixed

- Fixed race condition between two lists of chains causing "trying to access peers of undefined" errors ([#881](https://github.com/paritytech/substrate-connect/pull/881)).

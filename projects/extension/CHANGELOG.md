# Changelog

## [Unreleased]

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

# Changelog

## [Unreleased]

### Added

- Replace the `rococo_v2` well-known chain with `rococo_v2_1`. Note that this does not break `@substrate/connect`, as it automatically falls back to downloading chain specifications if `rococo_v2` is requested. ([#879](https://github.com/paritytech/substrate-connect/pull/879))
- Add a new tab in the options showing the logs of the underlying client (#429](https://github.com/paritytech/substrate-connect/issues/429))

### Changed

- Update @substrate/smoldot-light to [version 0.6.8](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#068---2022-03-23) ([#890](https://github.com/paritytech/substrate-connect/pull/890))
- The smoldot background worker will now bound its CPU usage to 50% of one CPU on average.

### Fixed

- Fixed race condition between two lists of chains causing "trying to access peers of undefined" errors ([#881](https://github.com/paritytech/substrate-connect/pull/881)).

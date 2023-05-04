# Changelog

## [Unreleased]

## 0.2.7 - 2023-05-04

### Changed

- Update smoldot@[version 1.0.4](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#104---2023-05-03)[#1429](https://github.com/paritytech/substrate-connect/pull/1429)

## 0.2.6 - 2023-05-01

### Changed

- Update smoldot@[version 1.0.3](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#102---2023-04-12)[#1426](https://github.com/paritytech/substrate-connect/pull/1426)

## 0.2.5 - 2023-04-20

### Changed

- Update smoldot@[version 1.0.2](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#102---2023-04-12)[#1420](https://github.com/paritytech/substrate-connect/pull/1420)

## 0.2.4 - 2023-04-04

### Changed

- Update smoldot@[version 1.0.1](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#101---2023-03-29)[#1410](https://github.com/paritytech/substrate-connect/pull/1410)

## 0.2.3 - 2023-03-16

### Changed

- Update @substrate/smoldot-light to smoldot@[version 1.0.0](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#100---2022-03-12). ([#1398](https://github.com/paritytech/substrate-connect/pull/1398))

## 0.2.2 - 2022-11-18

### Added

- Add new bootnodes screen in Options page, that allows the user to enable/disable/add/remove the bootnodes of the well-known chains. ([#1294](https://github.com/paritytech/substrate-connect/pull/1294))

### Changed

- Update @substrate/smoldot-light to [version 0.7.7](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#077---2022-11-11). ([#1345](https://github.com/paritytech/substrate-connect/pull/1345))
- At the initialization of the extension, and then every 24 hours, a light client is started in the background in order to synchronize with the four well-known chains (Polkadot, Kusama, Westend, Rococo). The result can then be used as a starting point when a web page connects to one of these four chains. ([#1319](https://github.com/paritytech/substrate-connect/pull/1319))
- An icon is now shown for a certain chain only if this chain was added using `addWellKnownChain` rather than `addChain`. This prevents tabs from impersonating chains. ([#1318](https://github.com/paritytech/substrate-connect/pull/1318))

## 0.2.1 - 2022-10-18

### Changed

- Revert the extension to manifest v2 format, for compatibility with Firefox. ([#1313](https://github.com/paritytech/substrate-connect/pull/1313))

## 0.2.0 - 2022-10-18

### Changed

- The extension is now using the manifest v3 format. ([#1280](https://github.com/paritytech/substrate-connect/pull/1280), [#1293](https://github.com/paritytech/substrate-connect/pull/1293), [#1295](https://github.com/paritytech/substrate-connect/pull/1295))
- Due to the update to manifest v3, the light client no longer runs in the extension but in each tab (that tries to connect to a chain) individually. As a consequence of this, the light client is no longer capable of opening non-secure WebSocket connections, and thus connectivity to chain might be greatly reduced. ([#1272](https://github.com/paritytech/substrate-connect/pull/1272))
- Improve the UI of the popup and options page. ([#1277](https://github.com/paritytech/substrate-connect/pull/1277))
- Update @substrate/smoldot-light to [version 0.7.2](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#072---2022-10-12). ([#1300](https://github.com/paritytech/substrate-connect/pull/1300))

## 0.1.11 - 2022-09-21

### Added

- The latest block number of each chain is now displayed in the extension popup. ([#1254](https://github.com/paritytech/substrate-connect/pull/1254))

### Changed

- Update @substrate/smoldot-light to [version 0.6.34](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0634---2022-09-20). ([#1261](https://github.com/paritytech/substrate-connect/pull/1261))
- Multiple versions of the extension can now be installed at the same time without them conflicting with each other. ([#1255](https://github.com/paritytech/substrate-connect/pull/1255))

## 0.1.10 - 2022-09-15

### Changed

- Update @substrate/smoldot-light to [version 0.6.33](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0633---2022-09-13). ([#1248](https://github.com/paritytech/substrate-connect/pull/1248))

## 0.1.9 - 2022-09-12

### Changed

- Show error message when smoldot crashes in both Popup and Options page. ([#1128](https://github.com/paritytech/substrate-connect/pull/1228))
- Update @substrate/smoldot-light to [version 0.6.32](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0632---2022-09-07). ([#1244](https://github.com/paritytech/substrate-connect/pull/1244))

## 0.1.8 - 2022-07-12

### Changed

- Update @substrate/smoldot-light to [version 0.6.23](https://github.com/paritytech/smoldot/blob/main/bin/wasm-node/CHANGELOG.md#0623---2022-07-11). ([#1146](https://github.com/paritytech/substrate-connect/pull/1146))

## 0.1.7 - 2022-06-17

### Fixed

- Fix errors appearing in the logs about calling `chainHead_unstable_unpin` (again) and `chainHead_unstable_header` with `null` as parameter. ([#1119](https://github.com/paritytech/substrate-connect/pull/1119), [#1120](https://github.com/paritytech/substrate-connect/pull/1120), [#1122](https://github.com/paritytech/substrate-connect/pull/1122))

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

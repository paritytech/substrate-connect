# Changelog

## 0.5.3

### Patch Changes

- c69adf0: chore: update chainspecs
- 796c168: chore: update polkadot-api packages
- Updated dependencies [e3319c6]
- Updated dependencies [796c168]
  - @substrate/light-client-extension-helpers@2.0.3

## 0.5.2 - 2024-07-02

### Patch Changes

- 932dc47: chore: update chainspecs
  - @substrate/light-client-extension-helpers@2.0.2

## 0.5.1 - 2024-06-27

### Changed

- Update chainspecs
- Implement @substrate/smoldot-discovery instead of @substrate/connect-discovery

## 0.5.0 - 2024-06-17

### Changed

- Update chainspecs
- Use the new Substrate Discovery Protocol
- Fix Chains Getting Stuck

## 0.4.5 - 2024-05-24

### Changed

- Update chainspecs
- Force smoldot to restart whenever it crashes [#2191](https://github.com/paritytech/substrate-connect/pull/2162)

### Changed

## 0.4.4 - 2024-04-24

### Changed

- Update chainspecs
- Change usage of @polkadot-api/client 0.0.1 to @polkadot-api/observable-client 0.0.1 [#2118](https://github.com/paritytech/substrate-connect/pull/2118)

## 0.4.3 - 2024-04-10

### Changed

- Update @polkadot-api/client to v0.0.1 [#2073](https://github.com/paritytech/substrate-connect/pull/2073)
- Update @polkadot-api/substrate-client to v0.0.1 [#2073](https://github.com/paritytech/substrate-connect/pull/2073)
- Update @substrate/light-client-extension-helpers to v0.0.5 [#2072](https://github.com/paritytech/substrate-connect/pull/2072)

## 0.4.2 - 2024-03-12

### Changed

- Update chainspecs
- Update smoldot@[version 2.0.22](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2022---2024-03-04) [#1936](https://github.com/paritytech/substrate-connect/pull/1936)
- Update @polkadot-api to 0.0.1-492c132563ea6b40ae1fc5470dec4cd18768d182.1.0 [#1921](https://github.com/paritytech/substrate-connect/pull/1921)
- Update `@substrate/light-client-extension-helpers` to v0.0.4 [#1971](https://github.com/paritytech/substrate-connect/pull/1971)

## 0.4.1 - 2024-02-23

### Changed

- Updated chainspecs
- Speed up chain initialization [#1877](https://github.com/paritytech/substrate-connect/pull/1877)

## 0.4.0 - 2024-02-21

### Changed

- Use RPC messages between inpage script, content script, extension pages and background script [#1766](https://github.com/paritytech/substrate-connect/pull/1766)
- Announce LightClient provider with custom events [#1845](https://github.com/paritytech/substrate-connect/pull/1845)

## 0.3.1 - 2024-01-18

### Changed

- Use `@substrate/light-client-extension-helpers`
- Update smoldot@[version 2.0.17](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#2017---2024-01-17) [#1767](https://github.com/paritytech/substrate-connect/pull/1767)

## 0.3.0 - 2023-12-07

### Changed

- Use `@polkadot-api/light-client-extension-helpers` in background and content scripts ([#1603](https://github.com/paritytech/substrate-connect/pull/1603))
- Update Firefox to Manifest v3 ([#1603](https://github.com/paritytech/substrate-connect/pull/1603))
- Update bootnodes ([#1673](https://github.com/paritytech/substrate-connect/pull/1673))

## 0.2.13 - 2023-10-18

### Changed

- Update smoldot@[version 2.0.6](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#201---2023-09-08)[#1572](https://github.com/paritytech/substrate-connect/pull/1572)

## 0.2.12 - 2023-09-27

### Changed

- Replace chain Ids with chain Names for well known chains in ([#1563](https://github.com/paritytech/substrate-connect/pull/1563))
- Fix bootnode initialization ([#1565](https://github.com/paritytech/substrate-connect/pull/1565))

## 0.2.11 - 2023-09-26

### Changed

- Reduce background script bundle size ([#1560](https://github.com/paritytech/substrate-connect/pull/1560))

## 0.2.10 - 2023-09-14

### Changed

- Use `vite` to bundle the extension ([#1539](https://github.com/paritytech/substrate-connect/pull/1539))
- Run `smoldot` in the background script with `@substrate/connect` ([#1512](https://github.com/paritytech/substrate-connect/pull/#1512))

## 0.2.9 - 2023-07-25

### Changed

- Update smoldot@[version 1.0.13](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#1013---2023-07-16)[#1493](https://github.com/paritytech/substrate-connect/pull/1493)

## 0.2.8 - 2023-07-10

### Changed

- Update smoldot@[version1.0.11 ](https://github.com/smol-dot/smoldot/blob/main/wasm-node/CHANGELOG.md#1011---2023-06-25)[#1463](https://github.com/paritytech/substrate-connect/pull/1463)

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

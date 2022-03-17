# Changelog

## [Unreleased]

### Added

- The `isExtensionPresent` constant indicates whether the substrate-connect extension has been detected.

### Changed

- The inline client ("SmoldotProvider") no longer tries to connect to non-WebSocket addresses. This was previously the case when using the library from within NodeJS. This change ensures consistency in terms of blockchain connectivity between browsers and NodeJS. ([#863](https://github.com/paritytech/substrate-connect/pull/863))
- The error message when passing an invalid well-known chain name to `addWellKnownChain` is no longer confusing.

### Fixed

- Fixed wrong unsubscription JSON-RPC methods being used when calling `ProviderInterface.disconnect()` ([#842](https://github.com/paritytech/substrate-connect/pull/842)).

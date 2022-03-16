# Changelog

## [Unreleased]

# Changed

- The inline client ("SmoldotProvider") no longer tries to connect to non-WebSocket addresses. This was previously the case when using the library from within NodeJS. This change ensures consistency in terms of blockchain connectivity between browsers and NodeJS. ([#863](https://github.com/paritytech/substrate-connect/pull/863))

# Fixed

- Fixed wrong unsubscription JSON-RPC methods being used when calling `ProviderInterface.disconnect()` ([#842](https://github.com/paritytech/substrate-connect/pull/842)).

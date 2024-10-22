---
"@substrate/connect": major
"@substrate/smoldot-discovery": major
"@substrate/smoldot-discovery-connector": minor
---

## Breaking Changes

- Modified `addChain` and `addWellKnownChain` methods:
  - Now accept a single `options` object parameter instead of separate `jsonRpcCallback` and `databaseContent` parameters
  - The `jsonRpcCallback` is now passed as `options.jsonRpcCallback`
  - The `databaseContent` is now passed as `options.databaseContent`

- Removed `JsonRpcCallback` type export. Use the callback type from the `options` parameter of `addChain` and `addWellKnownChain` instead.

- Updated peer dependency for `@substrate/smoldot-discovery` to "^3"

## New Features

- Added new methods to the Chain interface to conform with smoldot's interface:
  - `nextJsonRpcResponse`: Returns a promise that resolves with the next JSON-RPC response
  - `jsonRpcResponses`: Returns an async iterable of JSON-RPC responses

## Other Changes

- Updated internal implementation to use Effect for streaming JSON RPC responses in a Queue.
- Updated error handling to include `QueueFullError`.

## Migration Guide

Users of this package will need to update their code to use the new method signatures for `addChain` and `addWellKnownChain`, and adapt to the removed `JsonRpcCallback` type export. Please refer to the updated documentation for the new usage patterns.

When upgrading, ensure you're using version 3 or higher of `@substrate/smoldot-discovery` as a peer dependency.

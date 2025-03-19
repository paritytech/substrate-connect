# @substrate/smoldot-discovery-connector

## 0.3.8

### Patch Changes

- @substrate/light-client-extension-helpers@2.7.3

## 0.3.7

### Patch Changes

- 92316c0: chore(deps-dev): bump vitest in the npm_and_yarn group

  Bumps the npm_and_yarn group with 1 update: [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest).

  Updates `vitest` from 2.1.4 to 2.1.9

  - [Release notes](https://github.com/vitest-dev/vitest/releases)
  - [Commits](https://github.com/vitest-dev/vitest/commits/v2.1.9/packages/vitest)

  ***

  updated-dependencies:

  - dependency-name: vitest
    dependency-type: direct:development
    dependency-group: npm_and_yarn
    ...

  Signed-off-by: dependabot[bot] <support@github.com>

- Updated dependencies [96e6189]
- Updated dependencies [92316c0]
  - @substrate/light-client-extension-helpers@2.7.2
  - @substrate/smoldot-discovery@2.0.2

## 0.3.6

### Patch Changes

- @substrate/light-client-extension-helpers@2.7.1

## 0.3.5

### Patch Changes

- Updated dependencies [504ca9a]
- Updated dependencies [0fbe39a]
- Updated dependencies [654165c]
  - @substrate/light-client-extension-helpers@2.7.0

## 0.3.4

### Patch Changes

- @substrate/light-client-extension-helpers@2.6.1

## 0.3.3

### Patch Changes

- 5baa034: fix: smoldot discovery connector cjs imports

## 0.3.2

### Patch Changes

- cb1b051: fix: smoldot discovery connector webpack bundler issues
- Updated dependencies [29b6ebf]
- Updated dependencies [ca4769f]
- Updated dependencies [ff20390]
- Updated dependencies [f6cef04]
- Updated dependencies [7ee9c18]
- Updated dependencies [20eea99]
  - @substrate/light-client-extension-helpers@2.6.0

## 0.3.1

### Patch Changes

- 09f1c22: chore(deps-dev): bump vitest from 2.0.5 to 2.1.4

  Bumps [vitest](https://github.com/vitest-dev/vitest/tree/HEAD/packages/vitest) from 2.0.5 to 2.1.4.

  - [Release notes](https://github.com/vitest-dev/vitest/releases)
  - [Commits](https://github.com/vitest-dev/vitest/commits/v2.1.4/packages/vitest)

  ***

  updated-dependencies:

  - dependency-name: vitest
    dependency-type: direct:development
    update-type: version-update:semver-minor
    ...

  Signed-off-by: dependabot[bot] <support@github.com>

- Updated dependencies [09f1c22]
- Updated dependencies [0467f6b]
  - @substrate/light-client-extension-helpers@2.5.2
  - @substrate/smoldot-discovery@2.0.1

## 0.3.0

### Minor Changes

- e2a5cef: ## Breaking Changes

  - Modified `addChain` and `addWellKnownChain` methods:
    - Now accept a single `options` object parameter instead of separate `jsonRpcCallback` and `databaseContent` parameters
    - The `jsonRpcCallback` is now passed as `options.jsonRpcCallback`
    - The `databaseContent` is now passed as `options.databaseContent`
  - Removed `JsonRpcCallback` type export. Use the callback type from the `options` parameter of `addChain` and `addWellKnownChain` instead.
  - Updated peer dependency for `@substrate/smoldot-discovery` to "^2"

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

## 0.2.1

### Patch Changes

- @substrate/light-client-extension-helpers@2.5.1

## 0.2.0

### Minor Changes

- 198b375: chore: catalog and upgrade papi dependencies

### Patch Changes

- Updated dependencies [8ac12d3]
- Updated dependencies [198b375]
  - @substrate/light-client-extension-helpers@2.5.0

## 0.1.1

### Patch Changes

- d42336d: refactor: fix json rpc provider naming
- Updated dependencies [02b2fd0]
- Updated dependencies [a55d6f2]
- Updated dependencies [972af65]
- Updated dependencies [bb4a50b]
  - @substrate/light-client-extension-helpers@2.4.1

## 0.1.0

### Minor Changes

- b476e7e: update build system to tshy

### Patch Changes

- Updated dependencies [5f8b9ce]
- Updated dependencies [b476e7e]
  - @substrate/light-client-extension-helpers@2.4.0

## 0.0.5

### Patch Changes

- Updated dependencies [076439e]
- Updated dependencies [bc9fe42]
  - @substrate/light-client-extension-helpers@2.3.0

## 0.0.4

### Patch Changes

- @substrate/light-client-extension-helpers@2.2.2

## 0.0.3

### Patch Changes

- @substrate/light-client-extension-helpers@2.2.1

## 0.0.2

### Patch Changes

- Updated dependencies [4c5a75b]
- Updated dependencies [e35a0e8]
- Updated dependencies [cef7d50]
- Updated dependencies [188bf5b]
  - @substrate/light-client-extension-helpers@2.2.0

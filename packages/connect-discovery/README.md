# @substrate/connect-discovery

A TypeScript package to discover and filter Substrate Connect Extension providers from a list of providers using the [@substrate/discovery protocol](../discovery).

## Installation

You can install the package using npm or yarn:

```sh
corepack pnpm i @substrate/connect-discovery
```

## Usage

Here's an example of how to use the package:

```ts
import { getSubstrateConnectExtensionProviders } from "@substrate/connect-discovery"

const connectExtensionProviders = getSubstrateConnectExtensionProviders()

console.log(connectExtensionProviders)
```

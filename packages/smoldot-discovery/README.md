# @substrate/smoldot-discovery

A TypeScript package to discover and filter Smoldot extension providers from a list of providers.

## Installation

You can install the package using npm or yarn:

```sh
corepack pnpm i @substrate/smoldot-discovery
```

## Usage

Here's an example of how to use the package:

```ts
import { getSmoldotExtensionProviders } from "@substrate/smoldot-discovery"

const smoldotProviders = getSmoldotExtensionProviders()

console.log(smoldotProviders)
```

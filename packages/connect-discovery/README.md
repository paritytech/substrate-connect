<br /><br />

<div align="center">
  <h1 align="center">@substrate/connect-discovery</h1>
  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/discovery">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/discovery" />
    </a>
    <a href="https://github.com/paritytech/substrate-connect/blob/master/LICENSE">
      <img alt="GPL-3.0-or-later" src="https://img.shields.io/npm/l/@substrate/discovery" />
    </a>
  </p>
</div>

<br /><br />

A TypeScript package extended from the [`@substrate/discovery`](../discovery/README.md) npm module, that allows to discover and filter Substrate Connect Extension providers from a list of providers.

/*
Maybe add something like?:

"""
**This interface is currently unstable and is likely to change**
"""

Also perhaps point to the interface one would need to implement etc, same as the smoldot-discovery readme?
*/

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

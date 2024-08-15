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

<div align="center" style="padding: 10px; border: 2px solid red; color: red; font-weight: bold; background-color: #ffe6e6;">
  ⚠️ WARNING: This interface is currently unstable and is likely to change ⚠️
</div>

<br /><br />

A TypeScript package extended from the [`@substrate/discovery`](../discovery/README.md) npm module, that allows to discover and filter Substrate Connect Extension providers from a list of providers.

## Installation

You can install the package using npm or yarn:

```sh
corepack pnpm i @substrate/connect-discovery
```

## Usage

Here's an example of how to use the package:

```ts
/* This throws errors.
  Module '"@substrate/connect-discovery"' has no exported member 'getSubstrateConnectExtensionProviders'.
  It seems to be defined inside the Unstable namespace

  import { Unstable } from "@substrate/connect-discovery";
  const connectExtensionProviders = Unstable.getSubstrateConnectExtensionProviders();
*/ 
import { getSubstrateConnectExtensionProviders } from "@substrate/connect-discovery"

const connectExtensionProviders = getSubstrateConnectExtensionProviders()

console.log(connectExtensionProviders)
```

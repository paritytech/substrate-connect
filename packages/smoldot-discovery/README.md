<br /><br />

<div align="center">
  <h1 align="center">@substrate/smoldot-discovery</h1>
  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/smoldot-discovery">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/smoldot-discovery" />
    </a>
    <a href="https://github.com/paritytech/substrate-connect/blob/master/LICENSE">
      <img alt="GPL-3.0-or-later" src="https://img.shields.io/npm/l/@substrate/smoldot-discovery" />
    </a>
  </p>
</div>

<br /><br />

A TypeScript package extended from the [`@substrate/discovery`](../discovery/README.md) NPM package, which enables the discovery and filtering of Smoldot extension providers from a list of providers.

To be utilized by dApps, extensions should implement the `SmoldotExtensionProviderDetail` interface. This can be achieved by following the extension side of the discovery protocol as detailed [here](../discovery/README.md), and then returning the implemented interface.

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

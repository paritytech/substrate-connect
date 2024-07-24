
<br /><br />

<div align="center">
   <img height="150" style="object-fit: contain" src="https://substrate.io/img/substrate_og.png" alt="substrate connect">
  <h4 align="center"> NPM packages that offers an innovative way to interact with <a href="https://substrate.dev/">Substrate</a>-based blockchains directly in your browser.</h4>
</div>

<br /><br />

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
  - [Overcoming Browser Limitations](#overcoming-browser-limitations)
  - [Seamless Integration](#seamless-integration)
- [Comprehensive API Documentation](#comprehensive-api-documentation)
- [Repository Structure](#repository-structure)
  - [Packages](#packages)
  - [Showcase Projects](#showcase-projects)
  - [Examples](#examples)
- [Development](#development)
  - [Getting Started](#getting-started)
  - [Cleanup Commands](#cleanup-commands)
- [Releasing](#releasing)
- [Useful Links](#useful-links)

## Introduction

Substrate Connect offers an innovative way to interact with [Substrate](https://substrate.dev/)-based blockchains directly in your browser, eliminating the need for an RPC server. By leveraging the [smoldot](https://github.com/smol-dot/smoldot) WASM light client, it ensures a secure and efficient connection to the blockchain network without dependency on specific third parties.

/*
I'm wondering whether it's worth saying something in this intro like:

"""
Write dApps that with the Polkadot network in a secure and effective way.

The aim of this repository is to provide NPM packages which can be used to:
- Provide a secure and efficient connection to the Polkadot network via [`@substrate/connect`](./packages/connect/), which leverages the excellent [Smoldot](https://github.com/smol-dot/smoldot) WASM light client.
- Discover browser extensions which implement [the discovery protocol](./packages/discovery/), including those which expose a light client via [`@substrate/smoldot-discovery`](./packages/smoldot-discovery/). Substrate connect will automatically leverage these where possible.
- Easily enhance a browser extension with a light client via [`@substrate/light-client-extension-helpers`](./packages/light-client-extension-helpers)

We also provide example projects which use the above, including;
   - **[Basic light client demo](./projects/demo)**: a demo using `@substrate/connect` to obtain information about chains on the Polkadot network.
   - **[Light client extension demo](./projects/extension/)**: an example of a browser extension which provides a light client.
   - **[Wallet extension demo](./projects/wallet-template/)**: an example of a browser extension which provides a full Polkadot wallet leveraging a light client.

Finally, we have:
- A [step by step guide](./projects/wallet-template/STEP-BY-STEP-GUIDE.md) on how to integrate a light client into a browser extension.
- Details on [the discovery protocol](./packages/discovery/), including how to implement the browser or extension side of it.
"""

Because:
- I feel like those are the main exports here (but perhaps there's something else worth a mention right here too?). Basically we provide a light client, a protocol for discovering relevant extensions, and a way to easily embed the light client in other extensions. Then the rest are auxiliary packages and examples/demos of how these work.
- I think we need a clear entry point into the documentation, so it's easy for somebody to start here and know exactly where to go to do whatever it is they want to do.
- We should link to STEP_BY_STEP_GUIDE.md somewhere prominent, otherwise it's easily missed, especially hidden away in the wallet-template project. Perhaps it needs to be more prominent than the one line above too. Not sure!
*/

### Overcoming Browser Limitations

Browser limitations on websockets from HTTPS pages make establishing a robust number of peers challenging, as many nodes must be available with TLS.
Substrate Connect addresses this issue through a powerful browser extension, allowing chains to stay synced in the background, thereby significantly enhancing the performance of your applications.

/*
This section feels like it could be more of a "why embed a light client in browser extensions?", which would be cool to have here after the intro.

Then the why is something like:
- Share one light client across multiple dApps, so that it only needs to spend time starting up (syncing) once, and we avoid slowing down dApps etc
- Overcoming browser limitations, enabling a more robust connection to the Polkadot ecosystem (or something like that)
*/

### Seamless Integration

When building an application with Substrate Connect, it automatically detects whether the user has the extension installed and utilizes it. If not, it seamlessly creates the WASM light client in-page for them. Built on [Polkadot JS](https://polkadot.js.org/docs/api), Substrate Connect ensures that your development experience is as smooth as using a traditional RPC server node.

/*
I'm not sure about this section; we could add a bit in the "substrate/connect" bullet point above for instance, or leave it to the substrtae/connect README since it's a bit of an implementation detail? I guess I'm thinking that the main export from this repository now is a means to integrate light clients into extensions and discover them, but I wonder if that's too narrow of a focus; def open to thoughts!
*/

## Comprehensive API Documentation

For detailed API usage, refer to the [Substrate Connect API documentation](https://paritytech.github.io/substrate-connect).

## Repository Structure

### [Packages](./packages/README.md)
   The core implementations of `@subtrate/connect` and `@substrate/discovery`, and some auxiliary packages.
   - **[@substrate/discovery](./packages/discovery/)**
   - **[@substrate/connect](./packages/connect/)**
   - **[@substrate/connect-known-chains](./packages/connect-known-chains/)**
   - **[@substrate/connect-discovery](./packages/connect-discovery)** and **[@substrate/smoldot-discovery](./packages/smoldot-discovery/)**

### [Showcase Projects](./projects/)

   Showcase full implementations of `@substrate/connect` and `@substrate/discovery` for a Wallet, Extension or Generic usage.

   - **[Wallet implementation](./projects/wallet-template/)**
   - **[Extension implementation](./projects/extension/)**
   - **[Parachain Demo](./projects/demo)**


### [Examples](./examples/)
   dApp and Extensions example implementations of `@substrate/connect` and `@substrate/discovery`.

## Development

This repository utilizes [pnpm workspaces](https://pnpm.io/workspaces) and `corepack`, ensuring the correct version of `pnpm` is used. For contributions, please review our [contributing guidelines](./CONTRIBUTING.md) to understand our workflow and how to smoothly integrate your contributions to the project.

### Getting Started

Follow these steps to install everything and launch a demo if you're hacking on this repository:

1. **Install Prerequisites** (tested with the following versions):
   - Node.js (node) v20.9.0
   - pnpm 9.0.6 (`npm install -g pnpm`)
   - corepack 0.20.0 (bundled with recent Node.js versions)

2. **Clone the Repository**:
   - `git clone https://github.com/paritytech/substrate-connect.git`
   - Navigate to the repository root: `cd substrate-connect`

3. **Install Dependencies**:
   - `corepack pnpm install`

4. **Run the Extension in Development Mode**:
   - In terminal A: `cd projects/extension && corepack pnpm dev`

5. **Launch the Extension**:
   - In terminal B: `cd projects/extension && corepack pnpm start`
   - This opens a Chrome browser window with the extension pre-loaded. Ensure
   the extension is running.

6. **Run the Demo Application**:
   - In terminal C: `cd projects/demo && corepack pnpm dev`
   - Navigate to the URL logged in the Chrome browser opened in step 5. You should see the extension activate and the demo app log the latest blocks.

### Cleanup Commands

To clean up all build artifacts in workspaces in the repository:
```bash
corepack pnpm clean
```

To clean up all build artifacts and dependencies in workspaces in the repository:
```bash
corepack pnpm deep-clean
```

## Releasing

For releasing a new version of the extension, follow the steps outlined in
[the release doc](./DEPLOY-RELEASE.md).

## Useful Links

- [Substrate Connect Documentation Page](https://substrate.io/developers/substrate-connect/)
- Download from:
  - [Chrome Store](https://chrome.google.com/webstore/detail/substrate-connect-extensi/khccbhhbocaaklceanjginbdheafklai)
  - [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/substrate-connect/)

/*
This makes me wonder what we should do with https://substrate.io/developers/substrate-connect/.

My assumption was that we'd move away from this extension (deprecating it eventually), and we'll move towards a world in which wallets can expose light clients, and then lilbraries like PAPI will connect or instantiate one as necessary. (I do wonder what the case is when multiple wallets expose a light client though; which would PAPI pick? We couldn't necessarily trust them after all)
*/
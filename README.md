
<br /><br />

<div align="center">
   <img height="150" style="object-fit: contain" src="https://substrate.io/img/substrate_og.png" alt="substrate connect">
  <h4 align="center"> NPM packages that offers an innovative way to interact with <a href="https://substrate.dev/">Substrate</a>-based blockchains directly in your browser.</h4>
</div>

<br /><br />

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
  - [Write Secure and Effective dApps with the Polkadot Network](#write-secure-and-effective-dapps-with-the-polkadot-network)
  - [Additional Resources](#additional-resources)
  - [Why Embed a Light Client in Browser Extensions?](#why-embed-a-light-client-in-browser-extensions)
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

Substrate Connect provides a groundbreaking method to engage with [Substrate](https://substrate.dev/)-based blockchains directly in your browser, eliminating the need for an RPC server. By utilizing the [smoldot](https://github.com/smol-dot/smoldot) WASM light client, it ensures a secure and efficient connection to the blockchain network without reliance on specific third parties.

### Write Secure and Effective dApps with the Polkadot Network

The aim of this repository is to offer NPM packages that can be used to:

- **Provide a secure and efficient connection to the Polkadot network** via [`@substrate/connect`](./packages/connect/), leveraging the excellent [Smoldot](https://github.com/smol-dot/smoldot) WASM light client.
- **Discover browser extensions** that implement [the discovery protocol](./packages/discovery/), including those which expose a light client via [`@substrate/smoldot-discovery`](./packages/smoldot-discovery/). Substrate Connect will automatically leverage these where possible.
- **Easily enhance a browser extension with a light client** via [`@substrate/light-client-extension-helpers`](./packages/light-client-extension-helpers).

We also provide example projects using the above packages, including:

- **[Basic light client demo](./projects/demo)**: a demo using `@substrate/connect` to obtain information about chains on the Polkadot network.
- **[Light client extension demo](./projects/extension/)**: an example of a browser extension that provides a light client.
- **[Wallet extension demo](./projects/wallet-template/)**: an example of a browser extension that provides a full Polkadot wallet leveraging a light client.

### Additional Resources

- A [step-by-step guide](./projects/wallet-template/STEP-BY-STEP-GUIDE.md) on how to integrate a light client into a browser extension.
- Details on [the discovery protocol](./packages/discovery/), including how to implement it on the browser or extension side.

### Why Embed a Light Client in Browser Extensions?

Embedding a light client in browser extensions offers several advantages:

- **Shared Light Client Across Multiple dApps:** By sharing a single light client among various decentralized applications (dApps), the time spent on startup and syncing is reduced. This avoids slowing down individual dApps and enhances overall efficiency.
- **Overcoming Browser Limitations:** Browser limitations on WebSockets from HTTPS pages make it challenging to establish a robust number of peers, as many nodes must be available with TLS. Substrate Connect addresses this issue through a powerful browser extension, enabling chains to stay synced in the background and significantly improving the performance of your applications. This ensures a more robust connection to the Polkadot ecosystem.

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

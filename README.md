# Substrate Connect

Substrate connect provides a way to interact with [substrate](https://substrate.dev/)
based blockchains in the browser without using an RPC server. Substrate connect
uses a [smoldot](https://github.com/paritytech/smoldot/) WASM light client to
securely connect to the blockchain network without relying on specific 3rd parties.

Due to browser limitations on websockets from https pages, establishing a good
number of peers is difficult as many nodes need to be available with TLS.  Substrate
connect provides a browser extension to overcome this limitation and to keep 
the chains synced in the background, which makes your apps faster.

When building an app with substrate connect, it will detect whether the user has
the extension and use it, or create the WASM light client in-page for them.

Substrate connect builds on [Polkadot JS](https://polkadot.js.org/docs/api) so
building an app is the same experience as with using a traditional RPC server
node.

The substrate connect [API documentation is published here](https://paritytech.github.io/substrate-connect/api/).

## Building an app with @substrate/connect and installing the extension

**[The most up-to-date usage instructions for app builders can be found here](https://docs.substrate.io/learn/light-clients-in-substrate-connect/)**

## Development

This repository is using [yarn classic workspaces](https://classic.yarnpkg.com/en/docs/workspaces/).

We are tracking our work and milestones in a [github project](https://github.com/paritytech/substrate-connect/projects/1).

Please see our [contributing guidelines](./CONTRIBUTING.md) for details on how
we like to work and how to smoothly contribute to the project.

## Getting Started

1. Clone the whole `substrate-connect` repository.

```bash
git clone https://github.com/paritytech/substrate-connect.git
```

2. Install all dependencies

```bash
yarn install
```

3. Compile all packages and projects

```bash
yarn build
```

To clean up all build artefacts in workspaces in the repository, run:

```bash
yarn clean
```

To clean up all build artefacts and dependencies in workspaces in the repository, run:

```bash
yarn deep-clean
```

## Run local version of Smoldot Extension
Running the following command will build all necessary dependencies and run the Smoldot Extension in development mode with hot reloading enabled. Once run a new (Chrome) browser will appear with the extension added.

```bash
yarn dev:extension
```

(Make sure to run `$ yarn install` before.)

## Run local version of Burnr wallet
Running the following command will build all necessary dependencies and run the Substrate Burnr Wallet in development mode with hot reloading enabled. It will be served on http://localhost:1234/

```bash
yarn dev:burnr
```

(Make sure to run `$ yarn install` before.)


## [Deployments and releases](./DEPLOY-RELEASE.md)


## Substrate Connect Extension

A Browser extension that keeps the latest state of well known substrate-based chains' specs and bootnodes (Polkadot, Kusama, Rococo, Westend) synced across tabs - using Substrate Connect and Smoldot light client; 

The Extension is using Substrate Connect and Smoldot light client node modules. This extension, upon browser initiation updates and synchronizes in the well known substrate chain specs (Polkadot, Kusama, Rococo, Westend), keeping them to the latest state inside the extension, for faster chain sync. When a dApp that supports Substrate Connect (e.g. polkadotJS apps) starts in a browser's tab, then it receives the latest specs from the Extension instead of wrap-syncing from the last imported inside the dApp; At the same time, the dApp will appear inside the Extension as "connected" - meaning that it is using the Extension's bootnodes and specs;

## Useful Links:
[Substrate Connect Documentation Page](https://substrate.io/developers/substrate-connect/)

Download at:
- [Chrome Store](https://chrome.google.com/webstore/detail/substrate-connect-extensi/khccbhhbocaaklceanjginbdheafklai)
- [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/substrate-connect/)

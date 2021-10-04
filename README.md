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

**[The most up-to-date usage instructions for app builders can be found here](https://paritytech.github.io/substrate-connect/)**

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

## Run local version of the Smoldot browser demo
Running the following command will build all necessary dependencies and run the Smoldot browser demo. It will be served on https://localhost:1234/

```bash
yarn dev:smoldot-browser-demo
```

(Make sure to run `$ yarn install` before.)

## Run the Multiple Network browser demo
The Multiple Network functionality enables connecting to multiple networks from a single web-page.
Running the following command will build all necessary dependencies and run the Multiple Network browser demo. It will be served on https://localhost:1234/

```bash
yarn dev:parachain-demo
```

(Make sure to run `$ yarn install` before.)

## Run the Parachain Network browser demo
The Parachain demo showcases the connection of a uApp to the 'Westend' chain and 'Westmint' parachain and retrieves a list of the tokens from Westmint.
Running the following command will build all necessary dependencies and run the Parachain demo. It will be served on https://localhost:1234/

```bash
yarn dev:multiple-network-demo 
```

(Make sure to run `$ yarn install` before.)

## Run local version of Burnr wallet
Running the following command will build all necessary dependencies and run the Substrate Burnr Wallet in development mode with hot reloading enabled. It will be served on http://localhost:1234/

```bash
yarn dev:burnr
```

(Make sure to run `$ yarn install` before.)


## [Deployments and releases](./DEPLOY-RELEASE.md)

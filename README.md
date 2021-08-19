# Substrate Connect

**[The most up-to-date usage instructions for app builders can be found here](https://paritytech.github.io/substrate-connect/)**

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

## Run local version of Burnr wallet
Running the following command will build all necessary dependencies and run the Substrate Burnr Wallet in development mode with hot reloading enabled. It will be served on http://localhost:1234/

```bash
yarn dev:burnr
```

(Make sure to run `$ yarn install` before.)

## Run local version of the Smoldot browser demo
Running the following command will build all necessary dependencies and run the Smoldot browser demo. It will be served on https://localhost:1234/

```bash
yarn dev:smoldot-browser-demo
```

(Make sure to run `$ yarn install` before.)

## Run local version of Smoldot Extension
Running the following command will build all necessary dependencies and run the Smoldot Extension in development mode with hot reloading enabled. Once run a new (Chrome) browser will appear with the extension added.

```bash
yarn dev:smoldot-extension
```

(Make sure to run `$ yarn install` before.)

## Deploy Smoldot browser demo to Github Pages

Before deploying make sure you have a clean working copy with no staged changes.
The deploy script will deploy the last commit on your current branch.

The deployment will build the smoldot browser demo into the dist folder and 
construct a commit containing just that folder with a message containing a 
reference to the SHA of the commit it came from and push that to the gh-pages
branch. The dist folder remains ignored by git.

You can deploy to Github pages like so:

```bash
yarn deploy:gh-pages:smoldot-browser-demo
```

## Deploy Smoldot browser demo to IPFS

Before deploying make sure you have a Piñata API key and secret and that you
have exported them in your shell environment:

```bash
PINATA_API_KEY=<your key>
PINATA_API_SECRET=<your secret>
```

You can then deploy to IPFS like so:

```bash
yarn deploy:ipfs:smoldot-browser-demo
```

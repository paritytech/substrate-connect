# Substrate Connect

Run Wasm Light Clients of any Substrate based chain directly in your browser.

**Substrate Connect** is not the name of a single product, it rather describes a vision or notion that will allow developers to quickly generate and run Wasm Light Clients of their Substrate based chains - as easy as installing a node module.

Substrate Connect provides the infrastructure to run these clients directly in the browser and any other JavaScript or Node environment without deeper additional programming efforts needed. It adds Substrate light-client functionality to any Javascript environment, from in-browser applications to browser extensions and electron apps up to IOT devices and mobile phones.

It also provides an interface that enables Dapp developers to effortlessly make use of the light-client functionality in their applications.

### **Multiple building blocks on different levels are necessary to achieve this:**

1. **Ready-to-use Substrate Wasm Light-Clients** to be executed in the browser. They are part of the Substrate framework and with that, available for every Substrate based project. If developers want to generate a light client of their chain, all it takes is just one command to compile a library that contains everything that's needed to run a light client in the browser.

2) A **node module that bundles the light-clients** of different chains. It provides an interface that allows developers to run light nodes of different chains and to add runtimes and genesis configs of their own chain.

The `@substrate/connect` node module will allow developers to include light client functionality into their application by using a predefined interface.

3. For in-browser use, Substrate Connect provides a **Browser Extension** built upon the @substrate/light node module that is running the selected light clients inside the extension so that the end-user doesn't need to fire up a light node in every browser tab. This will also allow the light-node to keep syncing as long as the browser window stays open.

When used in individual projects, the Substrate Connect node module will first check for the installed extension. If available, it will try to connect to the light client running inside the extension. Only if the extension is not installed it will start a light client in the browser tab.


## Installation:

This repository is using [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) for dependency management together with [Lerna](https://lerna.js.org/) to handle releases.


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

To clean up all workspaces in the repository, run:

```bash
yarn clean
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

## Working with this repository

Substrate Connect is using Yarn workspaces to manage dependencies. 

Read more about it here: https://classic.yarnpkg.com/en/docs/workspaces/

### Adding modules to single repositories

To add new dependencies, please use the following syntax:

```
yarn workspace [module name from package.json] add your-desired-npm-package
```
Example to add Jest to the Burnr Wallet:
```
yarn workspace @substrate/burnr add jest
```

Also see https://classic.yarnpkg.com/en/docs/cli/workspace/

### GH Pages Links
This is a test for GH-Pages:
[Burnr](https://paritytech.github.io/substrate-connect/burnr) and
[Smoldot Browser Demo](https://paritytech.github.io/substrate-connect/smoldot-browser-demo) and
[Multiple Network Demo](https://paritytech.github.io/substrate-connect/multiple-network-demo)

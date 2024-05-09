# Substrate Connect

Substrate connect provides a way to interact with [substrate](https://substrate.dev/)
based blockchains in the browser without using an RPC server. Substrate connect
uses a [smoldot](https://github.com/smol-dot/smoldot) WASM light client to
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

## Development

This repository is using [pnpm workspaces](https://pnpm.io/workspaces).

We also use `corepack`, which ensures that the correct version of `pnpm` is used.

Please see our [contributing guidelines](./CONTRIBUTING.md) for details on how
we like to work and how to smoothly contribute to the project.

### Getting Started

If you're hacking on this repository, here's how to install everything and spin up a demo:

1. Install any prerequisites. These steps were tested with:
   - Node.js (node) v20.9.0.
   - pnpm 9.0.6 (`npm install -g pnpm`).
   - corepack 0.20.0 (This should be bundled with recent Node.js versions).
2. Clone the repository.
   - `git clone https://github.com/paritytech/substrate-connect.git`
   - `cd substrate-connect` to navigate to the repository root.
3. Install the dependencies.
   - `corepack pnpm install`
4. In terminal A, run `cd projects/extension && corepack pnpm dev`.
5. In terminal B, run `cd projects/extension && corepack pnpm start`.
   - This will open a Chrome browser window with the extension pre-loaded.
   - Make sure that the extension is running.
6. In terminal C, run `cd projects/demo && corepack pnpm dev`.
   - Navigate to the URL that this logs in the Chrome browser that opened in 5.
   - You should see the extension come to life and the demo app log latest blocks.

To clean up all build artefacts in workspaces in the repository, run:

```bash
corepack pnpm clean
```

To clean up all build artefacts and dependencies in workspaces in the repository, run:

```bash
corepack pnpm deep-clean
```

## Releasing

Visit [the release doc](./DEPLOY-RELEASE.md) and follow the steps there to release a new version of the extension.

## Useful Links

[Substrate Connect Documentation Page](https://substrate.io/developers/substrate-connect/)

Download at:
- [Chrome Store](https://chrome.google.com/webstore/detail/substrate-connect-extensi/khccbhhbocaaklceanjginbdheafklai)
- [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/substrate-connect/)

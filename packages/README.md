# Substrate Connect Packages

Tools and libraries required to run Substrate light clients in the browser.

## [`@substrate/connect`](./connect/README.md)

A npm module that adds Substrate light-client functionality to any Javascript environment, from in-browser applications to browser extensions and electron apps up to IOT devices. It contains Wasm light clients from various chains, bundled in a single package. It makes running a light-client as easy as installing a npm module.

It provides an interface that allows developers to run light nodes of different chains and to add runtimes and genesis configs of their own chain.

The `@substrate/connect` node module allows developers to include light client functionality into their application by using a predefined interface. When used in individual projects, the Substrate Connect node module will first check for the installed extension. If available, it will try to connect to the light client running inside the extension. Only if the extension is not installed it will start a light client in the browser tab.

The `@substrate/connect-known-chains` node module implements a list of well-known chain specifications and is updated daily.

## [`@substrate/discovery`](./discovery/README.md)

The [`@substrate/discovery`](./discovery/README.md) node module allows developers to implement compliant extenstion discovery functionality into their application by using a predefined interface.

[`@substrate/smoldot-discovery`](./smoldot-discovery/README.md) and [`@substrate/connect-discovery`](./connect-discovery/README.md) are an extension of [`@substrate/discovery`](./discovery/README.md) and allow to find and filter extension providers implementing smoldot and substrate-connect functionality respectively.

## [Substrate Connect Extension](./light-client-extension-helpers/README.md)

A Browser Extension built upon the smoldot light-client module that is running the selected light clients inside the extension so that the end-user doesn't need to fire up a light node in every browser tab. This will also allow the light-node to keep syncing as long as the browser window stays open.
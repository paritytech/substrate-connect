# Substrate Connect Packages

Tools and libraries required to run Substrate light clients in the browser.

## `@substrate/connect`

A npm module that adds Substrate light-client functionality to any Javascript environment, from in-browser applications to browser extensions and electron apps up to IOT devices. It contains Wasm light clients from various chains, bundled in a single package. It makes running a light-client as easy as installing a npm module.

It provides an interface that allows developers to run light nodes of different chains and to add runtimes and genesis configs of their own chain.

The `@substrate/connect` node module allows developers to include light client functionality into their application by using a predefined interface.

## Substrate Connect Extension

A Browser Extension built upon the @substrate/light node module that is running the selected light clients inside the extension so that the end-user doesn't need to fire up a light node in every browser tab. This will also allow the light-node to keep syncing as long as the browser window stays open.

When used in individual projects, the Substrate Connect node module will first check for the installed extension. If available, it will try to connect to the light client running inside the extension. Only if the extension is not installed it will start a light client in the browser tab.

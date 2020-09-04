## `@substrate/connect`

A npm module that adds Substrate light-client functionality to any Javascript environment, from in-browser applications to browser extensions and electron apps up to IOT devices. It contains Wasm light clients from various chains, bundled in a single package. It makes running a light-client as easy as installing a npm module.

It provides an interface that allows developers to run light nodes of different chains and to add runtimes and genesis configs of their own chain.

The `@substrate/connect` node module allows developers to include light client functionality into their application by using a predefined interface.

## Usage:

```
$ yarn add @substrate/connect

// Also install the @polkadot/util package for TextEncoder polyfills - not included here as a dependency to keep the tree lean
$ yarn add @polkadot/util 
```


## Debugging FAQ

### Webpack
**Error `Can't resolve 'fs'`**
```
client?9669:159 substrate-connect/packages/nodejs/polkadot_cli.js
Module not found: Error: Can't resolve 'fs' in 'substrate-connect/packages/nodejs'
```
**Solution**
Add the following code snippet to your `webpack.config.js`

```
  node: {
    fs: 'empty'
  }
```
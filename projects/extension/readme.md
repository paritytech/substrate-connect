## Substrate Connect Extension

A Browser extension that keeps the latest state of well known substrate-based chains' specs and bootnodes (Polkadot, Kusama, Rococo, Westend) synced across tabs - using Substrate Connect and Smoldot light client; 

The Extension is using Substrate Connect and Smoldot light client node modules. This extension, upon browser initiation updates and synchronizes in the well known substrate chain specs (Polkadot, Kusama, Rococo, Westend), keeping them to the latest state inside the extension, for faster chain sync. When a dApp that supports Substrate Connect (e.g. polkadotJS apps) starts in a browser's tab, then it receives the latest specs from the Extension instead of wrap-syncing from the last imported inside the dApp; At the same time, the dApp will appear inside the Extension as "connected" - meaning that it is using the Extension's bootnodes and specs;

## Useful Links:
[Substrate Connect Documentation Page](https://substrate.io/developers/substrate-connect/)

Download at:
- [Chrome Store](https://chrome.google.com/webstore/detail/substrate-connect-extensi/khccbhhbocaaklceanjginbdheafklai)
- [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/substrate-connect/)


## Installation
Navigate to the project directory and install the dependencies.

```
$ yarn
```

To build the extension, and rebuild it when the files are changed, run

- Open a terminal and run
```
$  yarn run dev
```
This will initiate a "watch" terminal that will hot reload in every change (Changes polling: 1 second. Aggregation of changes: every 1 second.)

After the project has been built, a directory named `dist` has been created.
### 1st (best) way:
1. Open another terminal and run
- For dev mode on chrome:
```
$  yarn run start
```
- For dev mode on Firefox:
```
$  yarn run start:firefox
```

### 2nd way:
1. Open Chrome
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory.
(This requires reload of the extension every time a change is made)

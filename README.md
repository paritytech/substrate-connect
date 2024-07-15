# Substrate Connect

Substrate Connect offers an innovative way to interact with 
[Substrate](https://substrate.dev/)-based blockchains directly in your browser, 
eliminating the need for an RPC server. By leveraging the 
[smoldot](https://github.com/smol-dot/smoldot) WASM light client, it ensures a 
secure and efficient connection to the blockchain network without dependency 
on specific third parties.

### Overcoming Browser Limitations

Browser limitations on websockets from HTTPS pages make establishing a robust 
number of peers challenging, as many nodes must be available with TLS. 
Substrate Connect addresses this issue through a powerful browser extension, 
allowing chains to stay synced in the background, thereby significantly 
enhancing the performance of your applications.

### Seamless Integration

When building an application with Substrate Connect, it automatically detects 
whether the user has the extension installed and utilizes it. If not, it 
seamlessly creates the WASM light client in-page for them. Built on 
[Polkadot JS](https://polkadot.js.org/docs/api), Substrate Connect ensures 
that your development experience is as smooth as using a traditional RPC 
server node.

### Comprehensive API Documentation

For detailed API usage, refer to the [Substrate Connect API 
documentation](https://paritytech.github.io/substrate-connect/api/).

### Repository Structure

- [Packages](./packages/README.md):

The core implementations of `@subtrate/connect` and `@substrate/discovery`. 

- [Examples](./examples/)

dApp and Extensions example implementations of `@substrate/connect` and `@substrate/discovery`. 

- [Projects](./projects/)

Wallet, extension and demo implementations of `@substrate/connect` and `@substrate/discovery`, showcasing a full implementation of the packages in the respective environments.

## Development

This repository utilizes [pnpm workspaces](https://pnpm.io/workspaces) and 
`corepack`, ensuring the correct version of `pnpm` is used. For contributions, 
please review our [contributing guidelines](./CONTRIBUTING.md) to understand 
our workflow and how to smoothly integrate your contributions to the project.

### Getting Started

Follow these steps to install everything and launch a demo if you're hacking 
on this repository:

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
   - Navigate to the URL logged in the Chrome browser opened in step 5. You 
   should see the extension activate and the demo app log the latest blocks.

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

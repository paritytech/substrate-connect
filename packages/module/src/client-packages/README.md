# `@substrate/connect/src/client-packages`

Statically compiled substrate-connect WASM browser-demos we want to include in the npm package.

Currently this only contains the compiled and manually copied browser-demo of Polkadot.
Source files can be found here https://github.com/paritytech/polkadot/tree/master/cli/browser-demo.

The `browser-demo` was compiled without the `--no-typescript` flag to include the TypeScript definitions.

```
wasm-pack build --target web --out-dir ./browser-demo/pkg --release ./.. -- --no-default-features --features "browser"
```

## ToDo:

- Publish to npm as a module that can be imported here
- Update module on each release of a chain we want to include as a default
- Also Compile and publish selected chain_specs to node module

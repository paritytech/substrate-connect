# `@substrate/connect/src/client-specs`

The actual Light clients that can be imported from the module.

Currently this only contains the compiled and manually copied `chain_spec`'s of different Polkadot chains.

To generate a custom chain_spec, checkout the Polkadot GitHub Repo and navigate to the root.
The following specs are available:
https://github.com/paritytech/polkadot/blob/master/cli/src/command.rs#L56

Example: To build the kusama-local chain_spec.json, you'd have to run:

```
polkadot build-spec --chain kusama-local --raw > kusama-local.json
```

## ToDo:

- Make this more effective, don't repeat yourself.

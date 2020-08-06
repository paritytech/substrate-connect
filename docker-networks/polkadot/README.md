# Docker compose file to simulate a Polkadot network setup.

The images in the docker-compose.yml need to be from the same commit that is used to generate the `polkadot-local.json` chain_spec file used to run the local browser node.

To generate a new chain_spec file, checkout the [Polkadot repository](https://github.com/paritytech/polkadot) from github and navigate to the root and run:

```
$ cargo build --release
$ ./target/release/polkadot build-spec --chain polkadot-local --raw > polkadot-local.json
```

You will then find the chain_spec for a `polkadot-local` chain as `polkadot-local.json` int the root of the repository. Before using it on your local browser node, you need to change the IP address of the bootnode to:

```
"bootNodes": [
  "/ip4/127.0.0.1/tcp/30337/ws/p2p/QmT5MYjkTDpoREKZTS7qHLSKPCJubTwYqfr6YQmhfcFYro"
],
```

You can find a list of available genesis config chain_spec [here](https://github.com/paritytech/polkadot/blob/671cc75c4dcc8e05bdf3b722ddd63880f8166d8a/cli/src/command.rs#L55).

The current Polkadotcommit used is [9c04ebb5660634b72cd950dd53e10c9d8c1928ac (06-08-2020)](https://github.com/paritytech/polkadot/commit/9c04ebb5660634b72cd950dd53e10c9d8c1928ac)

**Setup:**
A basic local network with 3 validators connected to the public internet

**Usage:**

1. Pull containers: `docker-compose pull`

2. Start network and container: `docker-compose up`

3. Reach:
  - local node on localhost:9944
  - validator-alice: localhost:9945

4. Shut down network and container: `docker-compose down` to prune the database


Find more Docker images of Polkadot https://hub.docker.com/r/parity/polkadot/tags
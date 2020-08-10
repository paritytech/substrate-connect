# Docker compose file to simulate a Polkadot network setup.

The images in the docker-compose.yml need to be from the same commit that is used to generate the `polkadot-local.json` chain_spec file used to run the local browser node.

If you want to use a newer commit for your network, you need change the `ìmage:` of all 4 nodes in the `docker-compose.yml`file and generate a new chain_spec file from the same Docker image.

To do that, run the following command in the `./substrate-connect/docker-networks/polkadot` folder:

```
$ docker run -it parity/polkadot:master-0.8.22-55f69f3-9ed9b8b0 build-spec --raw > polkadot-local.json
```

You will then find the chain_spec for a `polkadot-local` chain as `polkadot-local.json` in this folder. Before using it on your local browser node, you need to change the IP address of the bootnode to:

```
"bootNodes": [
  "/ip4/127.0.0.1/tcp/30337/ws/p2p/QmT5MYjkTDpoREKZTS7qHLSKPCJubTwYqfr6YQmhfcFYro"
],
```

You can find a list of available genesis config chain_spec [here](https://github.com/paritytech/polkadot/blob/55f69f3679192264c38ffff3b3a0f2d833b52c8f/cli/src/command.rs#L55).

The current Polkadotcommit used is [55f69f3679192264c38ffff3b3a0f2d833b52c8f (10-08-2020)](https://github.com/paritytech/polkadot/commit/55f69f3679192264c38ffff3b3a0f2d833b52c8f)


T

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
# Deploying docs and releasing substrate connect

## Releasing

TODO

## Deploy Smoldot browser demo to Github Pages

Before deploying make sure you have a clean working copy with no staged changes.
The deploy script will deploy the last commit on your current branch.

The deployment will build the smoldot browser demo into the dist folder and 
construct a commit containing just that folder with a message containing a 
reference to the SHA of the commit it came from and push that to the gh-pages
branch. The dist folder remains ignored by git.

You can deploy to Github pages like so:

```bash
yarn deploy:gh-pages:smoldot-browser-demo
```

## Deploy Smoldot browser demo to IPFS

Before deploying make sure you have a Piñata API key and secret and that you
have exported them in your shell environment:

```bash
PINATA_API_KEY=<your key>
PINATA_API_SECRET=<your secret>
```

You can then deploy to IPFS like so:

```bash
yarn deploy:ipfs:smoldot-browser-demo
```


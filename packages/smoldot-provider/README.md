# Polkadot JS Provider for Smoldot Light Client

PR Notes:

* types for smoldot should be upstreamed to smoldot
* I didn't want to learn and bring in all the polkadot-js test infrastructure
until we're sure we want to upstream this.  I used ava instead as it has good
typescript support, runs the tests fast (in parallel) and I know it!

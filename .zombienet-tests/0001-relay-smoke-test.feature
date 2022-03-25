Description: Relay Chain Smoke Test
Network: ./0001-relay-smoke-test.toml
Creds: config

alice: is up
bob: is up
alice: reports block height is at least 5 within 360 seconds
alice: reports finalised height is at least 2 within 360 seconds
bob: js-script ./0001-checkSync.js within 380 seconds

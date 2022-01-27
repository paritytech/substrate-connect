Description: Smoke Test
Network: ./0001-smoke-test.toml
Creds: config


alice: is up
bob: is up
alice: js-script ./0001-custom.js return is equal to 12 within 120 seconds
bob: js-script ./0002-getHeaders.js return is greater than 1 within 120 seconds

# @substrate/smoldot-test-utils

Some helpers for mocking the behaviour of smoldot or to ensure certain interactions
happen.

Generally you will use this if you want to preprogram the responses that smoldot
returns in tests and you will use `mockSmoldot` with a `responder` to generate
the reponses.  E.g.

```
const { mockSmoldot, respondWith } from '@substrate/smoldot-test-utils';

const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
const ms = mockSmoldot(respondWith(mockResponses));
// ms contains a mock that looks like a smoldot client and will repond with the
// mock response provided (only once) and then error if any more requests are
// made
```

See the smoldot-provider tests for more examples

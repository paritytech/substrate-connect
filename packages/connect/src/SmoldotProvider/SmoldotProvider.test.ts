import sinon from 'sinon';
import { Database } from './Database';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';
import {
  erroringResponder,
  customHealthResponder,
  devChainHealthResponder,
  mockSmoldot,
  smoldotSpy,
  respondWith
} from '@substrate/smoldot-test-utils';

const EMPTY_CHAIN_SPEC = '{}';

class TestDatabase implements Database {
  load(): string  { return ''; }
  save(state: string) {}
  delete() {}
}
const testDb = () => new TestDatabase();

test('connect propagates errors', async () => {
  const badSmoldot = {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.reject(new Error('boom!'));
    }
  };
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), badSmoldot);
  let errored = false;

  provider.on('error', () => { errored = true; });
  try {
    await provider.connect();
  } catch (_) {
    expect(errored).toBe(true);
    await provider.disconnect();
  }
});

// non-subscription send
test('awaiting send returns message result', async () => {
  const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const ms = mockSmoldot(respondWith(mockResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  expect(reply).toBe('success');
  await provider.disconnect();
});

test('emits error when system_health responds with error', async () => {
  const ms = mockSmoldot(respondWith([]), erroringResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();
  return new Promise<void>((resolve, reject) => {
    provider.on('error', error => {
      expect(error.message).toBe('Got error response asking for system health');
      return provider.disconnect().then(() => resolve());
    });
  });
});

test('emits events when it connects then disconnects', async () => {
  const ms = mockSmoldot(respondWith([]), customHealthResponder([true, false]));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();
  return new Promise<void>((resolve, reject) => {
    provider.on('connected', () => {
      const off = provider.on('disconnected', () => {
        off(); // stop listening
        provider.disconnect().then(() => resolve());
      });
    });
  });
});

test('emits events when it connects / disconnects / reconnects', async () => {
  const ms = mockSmoldot(respondWith([]), customHealthResponder([true, false, true]));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();

  return new Promise<void>((resolve, reject) => {
    provider.on('connected', () => {
      const off = provider.on('disconnected', () => {
        off(); // stop listening
        provider.on('connected', () => {
          provider.disconnect().then(() => resolve());
        });
      });
    });
  });
});

// test('emits connect and never emits disconnect for development chain', async done => {
//   const ms = mockSmoldot(respondWith([]), devChainHealthResponder);
//   const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

//   // we don't want the test to be slow
//   provider.healthPingerInterval = 1;
//   await provider.connect();

//   return new Promise<void>((resolve, reject) => {
//     provider.on('connected', () => {
//       setTimeout(() => {
//         resolve();
//       }, 20);

//       provider.on('disconnected', () => {
//         done.fail('should never disconnect');
//         reject();
//       });
//     });
//   });
// });


test('send formats JSON RPC request correctly', async () => {
  // we don't really care what the reponse is
  const responses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const rpcSend = sinon.spy();
  const ss = smoldotSpy(respondWith(responses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ss);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  expect(rpcSend.called).toBe(true);
  const rpcJson = rpcSend.firstCall.firstArg;
  expect(rpcJson).toBe('{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  await provider.disconnect();
});

test('sending twice uses new id', async () => {
  const responses =  [
    '{ "id": 1, "jsonrpc": "2.0", "result": "success" }',
    '{ "id": 2, "jsonrpc": "2.0", "result": "success" }'
  ];
  const rpcSend = sinon.spy();
  const ss = smoldotSpy(respondWith(responses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ss);

  await provider.connect();
  await provider.send('hello', [ 'world' ]);
  await provider.send('hello', [ 'world' ]);

  expect(rpcSend.called).toBe(true);
  expect(rpcSend.calledTwice).toBe(true);

  const rpcJson1 = rpcSend.firstCall.firstArg;
  expect(rpcJson1).toBe('{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  const rpcJson2 = rpcSend.secondCall.firstArg;
  expect(rpcJson2).toBe('{"id":2,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  await provider.disconnect();
});

test('throws when got error JSON response', async () => {
  const ms = mockSmoldot(erroringResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();

   await expect(() => provider.send('hello', [ 'world' ]))
    .rejects
    .toThrow('666: boom!');

  await provider.disconnect();
});

test('send can also add subscriptions and returns an id', async () => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const reply = await provider.send('test_subscribe', []);
  expect(reply).toBe('SUBSCRIPTIONID');
  await provider.disconnect();
});

// test('subscribe', async done => {
//   const responses = [
//     '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
//     '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
//   ];
//   const ms = mockSmoldot(respondWith(responses));
//   const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

//   await provider.connect();

//   expect.assertions(2);
//   return new Promise<void>((resolve, reject) => {
//     return provider.subscribe('state_test', 'test_subscribe', [],  (error: Error | null, result: any) => {
//       if (error !== null) {
//         done.fail(error.message);
//         reject();
//       }

//       expect(result).toEqual({ dummy: "state" });
//       provider.disconnect().then(() => resolve());
//     }).then(reply => {
//       expect(reply).toBe("SUBSCRIPTIONID");
//     });
//   });
// });

// test('subscribe copes with out of order responses', async done => {
//   const responses = [
//     '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}',
//     '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}'
//   ];
//   const ms = mockSmoldot(respondWith(responses));
//   const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

//   await provider.connect();

//   expect.assertions(2);
//   return new Promise<void>((resolve, reject) => {
//     return provider.subscribe('state_test', 'test_subscribe', [],  (error: Error | null, result: any) => {
//       if (error !== null) {
//         done.fail(error.message);
//         reject();
//       }

//       expect(result).toEqual({ dummy: "state" });
//       provider.disconnect().then(() => {
//         resolve();
//       });
//     }).then(reply => {
//       expect(reply).toBe("SUBSCRIPTIONID");
//     });
//   });
// });

// test('converts british english method spelling to US', async done => {
//   const responses = [
//     '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
//     '{"jsonrpc":"2.0","method":"chain_finalisedHead","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
//   ];
//   const ms = mockSmoldot(respondWith(responses));
//   const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

//   await provider.connect();

//   expect.assertions(2);
//   return new Promise<void>((resolve, reject) => {
//     return provider.subscribe('chain_finalizedHead', 'chain_subscribeFinalizedHeads', [],  (error: Error | null, result: any) => {
//       if (error !== null) {
//         done.fail(error.message);
//         reject();
//       }

//       expect(result).toEqual({ dummy: "state" });
//       return provider.disconnect().then(() => resolve());
//     }).then(reply => {
//       expect(reply).toBe("SUBSCRIPTIONID");
//     });
//   });
// });

test('unsubscribe fails when sub not found', async () => {
  const responses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": "SUBSCRIPTIONID"  }',
    '{"jsonrpc":"2.0","method":"chain_finalisedHead","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  await provider.subscribe('test', 'test_subscribe', [], () => {});
  const reply =  await provider.unsubscribe('test', 'test_subscribe', 666);

  expect(reply).toBe(false);
  await provider.disconnect();
});

test('unsubscribe removes subscriptions', async () => {
  const responses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": "SUBSCRIPTIONID" }',
    '{"jsonrpc":"2.0","method":"test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}',
    '{ "id": 2, "jsonrpc": "2.0", "result": true }'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const id = await provider.subscribe('test', 'test_subscribe', [], () => {});
  const reply =  await provider.unsubscribe('test', 'test_unsubscribe', id);
  expect(reply).toBe(true);
  await provider.disconnect();
});
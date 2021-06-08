/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { jest } from '@jest/globals';

const EMPTY_CHAIN_SPEC = '{}';

test('connect propagates errors', async () => {
  const badSmoldot = {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.reject(new Error('boom!'));
    }
  };
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, badSmoldot);
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
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  expect(reply).toBe('success');
  await provider.disconnect();
});

test('emits error when system_health responds with error', async () => {
  const ms = mockSmoldot(respondWith([]), erroringResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

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
  const healthResponses = [
    { isSyncing: true, peerCount: 1, shouldHavePeers: true },
    { isSyncing: true, peerCount: 0, shouldHavePeers: true }
  ];
  const ms = mockSmoldot(respondWith([]), customHealthResponder(healthResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

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
  const healthResponses = [
    { isSyncing: true, peerCount: 1, shouldHavePeers: true },
    { isSyncing: true, peerCount: 0, shouldHavePeers: true },
    { isSyncing: true, peerCount: 1, shouldHavePeers: true }
  ];
  const ms = mockSmoldot(respondWith([]), customHealthResponder(healthResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

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

test('emits connect and never emits disconnect for development chain', async () => {
  const ms = mockSmoldot(respondWith([]), devChainHealthResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();

  return new Promise<void>((resolve, reject) => {
    provider.on('connected', () => {
      setTimeout(() => {
        resolve();
      }, 20);

      provider.on('disconnected', () => {
        reject('should never disconnect');
      });
    });
  });
}, 10000);


test('send formats JSON RPC request correctly', async () => {
  // we don't really care what the reponse is
  const responses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const rpcSend = jest.fn() as jest.MockedFunction<(rpc: string, chainIndex: number) => void>;
  const ss = smoldotSpy(respondWith(responses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ss);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  expect(rpcSend).toHaveBeenCalledWith('{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}', 0);
  await provider.disconnect();
});

test('sending twice uses new id', async () => {
  const responses =  [
    '{ "id": 1, "jsonrpc": "2.0", "result": "success" }',
    '{ "id": 2, "jsonrpc": "2.0", "result": "success" }'
  ];
  const rpcSend = jest.fn() as jest.MockedFunction<(rpc: string, chainIndex: number) => void>;
  const ss = smoldotSpy(respondWith(responses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ss);

  await provider.connect();
  await provider.send('hello', [ 'world' ]);
  await provider.send('hello', [ 'world' ]);

  expect(rpcSend).toHaveBeenCalledTimes(2);

  const rpcJson1 = rpcSend.mock.calls[0][0];
  expect(rpcJson1).toBe('{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  const rpcJson2 = rpcSend.mock.calls[1][0];
  expect(rpcJson2).toBe('{"id":2,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  await provider.disconnect();
});

test('throws when got error JSON response', async () => {
  const ms = mockSmoldot(erroringResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

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
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  await provider.connect();
  const reply = await provider.send('test_subscribe', []);
  expect(reply).toBe('SUBSCRIPTIONID');
  await provider.disconnect();
});

test('subscribe', async () => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  await provider.connect();

  expect.assertions(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('state_test', 'test_subscribe', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        reject(error.message);
      }

      expect(result).toEqual({ dummy: "state" });
      provider.disconnect().then(() => resolve());
    }).then(reply => {
      expect(reply).toBe("SUBSCRIPTIONID");
    });
  });
});

test('subscribe copes with out of order responses', async () => {
  const responses = [
    '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}',
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  await provider.connect();

  expect.assertions(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('state_test', 'test_subscribe', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        reject(error.message);
      }

      expect(result).toEqual({ dummy: "state" });
      provider.disconnect().then(() => {
        resolve();
      });
    }).then(reply => {
      expect(reply).toBe("SUBSCRIPTIONID");
    });
  });
});

test('converts british english method spelling to US', async () => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"chain_finalisedHead","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  await provider.connect();

  expect.assertions(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('chain_finalizedHead', 'chain_subscribeFinalizedHeads', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        reject(error.message);
      }

      expect(result).toEqual({ dummy: "state" });
      return provider.disconnect().then(() => resolve());
    }).then(reply => {
      expect(reply).toBe("SUBSCRIPTIONID");
    });
  });
});

test('unsubscribe fails when sub not found', async () => {
  const responses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": "SUBSCRIPTIONID"  }',
    '{"jsonrpc":"2.0","method":"chain_finalisedHead","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

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
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, ms);

  await provider.connect();
  const id = await provider.subscribe('test', 'test_subscribe', [], () => {});
  const reply =  await provider.unsubscribe('test', 'test_unsubscribe', id);
  expect(reply).toBe(true);
  await provider.disconnect();
});

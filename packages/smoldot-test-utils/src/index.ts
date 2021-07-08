import { Smoldot, SmoldotAddChainOptions, SmoldotChain, SmoldotClient, SmoldotJsonRpcCallback } from 'smoldot';
import { JsonRpcObject } from '@polkadot/rpc-provider/types';
import { jest } from '@jest/globals'
import asap from 'asap';

/**
 * SystemHealth is the type of the object in the `result` field of the JSON
 * RPC responses from smoldot for the "system_health" RPC request.
 *
 * @remarks
 *
 * We define `SystemHealth` instead of using the `Health` type in
 * interfaces/system/types in \@polkadot/api because its more ergonomic to use:
 * primitive booleans and numbers instead of the polkadotjs wrapped
 * Codec implementations of those.
 */
export interface SystemHealth {
  isSyncing: boolean;
  peerCount: number;
  shouldHavePeers: boolean;
}

/**
 * Response builders - functions that simplify making RPC responses
 */

/**
 * systemHealthReponse - creates a valid RPC response that looks like a response
 * to a "system_health" RPC request using the supplied system health info
 *
 * @returns a JSON string
 */
const systemHealthReponse = (id: number, health: SystemHealth) => {
  return `{"jsonrpc":"2.0","id":${id} ,"result":{"isSyncing":${health.isSyncing},"peers":${health.peerCount},"shouldHavePeers":${health.shouldHavePeers}}}`;
  }

/**
 * devChainHealthResponse - creates a valid RPC response that looks like a response
 * to a "system_health" RPC request that came from a "dev chain"
 *
 * @returns a JSON string
 *
 * @remarks
 *
 * If you're creating a temporary brand new chain locally, for testing purposes,
 * then you will be the only peer that exists for that chain. In which case
 * shouldHavePeers will be false to indicate that it's normal that peers is
 * equal to 0.
 */
const devChainHealthResponse = (id: number) => {
  return systemHealthReponse(id, { isSyncing: true, peerCount: 0, shouldHavePeers: false});
}

/**
 * RpcResponder - an RpcResponder is a type representing a function that takes
 * a JSON string representing an RPC request and uses it to create a JSON RPC
 * response.
 */
type RpcResponder = (requestJSON: string) => string;

/**
 * healthyResponder - takes a JSON request that is expected to look like a valid
 * "system_health" RPC request and returns a valid matching healthy response. It
 * takes the ID from the request and ensures the response has the same ID.
 *
 * @param requestJSON - the RPC request JSON
 * @returns a JSON string
 */
const healthyResponder = (requestJSON: string) => {
  const { id } = JSON.parse(requestJSON) as JsonRpcObject;
  return systemHealthReponse(id, { isSyncing: false, peerCount: 1, shouldHavePeers: true });
}

/**
 * devChainHealthResponder - takes a JSON request that is expected to look like
 * a valid "system_health" RPC request and returns a valid matching healthy
 * response for a "dev chain". It takes the ID from the request and ensures the
 * response has the same ID.
 *
 * @param requestJSON - the RPC request JSON
 * @returns a JSON string
 */
export const devChainHealthResponder = (requestJSON: string): string => {
  const { id } = JSON.parse(requestJSON) as JsonRpcObject;
  return devChainHealthResponse(id);
}

/**
 * unhealthyResponder - takes a JSON request that is expected to look like any
 * valid RPC request and and always generates an RPC error response.
 *
 * @param requestJSON - the RPC request JSON
 * @returns a JSON string
 */
export const erroringResponder = (requestJSON: string): string => {
  const { id } = JSON.parse(requestJSON) as JsonRpcObject;
  return `{ "id": ${id}, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }`;
}


/**
 * Orchestrators - these are higher order factory functions take the
 * definitions of a sequence of reponses to respond with and returns
 * `RpcResponder` function that when called will return a reponse matching what
 * was supplied one-by-one each time it is called until there are no more 
 * responses.
 */

const NO_MORE_RESPONSES = "json_rpc_callback was called but there are no mock responses left to respond with";

/**
 * customHealthResponder - takes a sequence of SystemHealth info and returns
 * a function that when called with valid RPC request strings will return
 * "system_health" responses until it has iterated all the supplied infos.
 *
 * @param healthResponses - The sequence of health infos to respond with
 * @returns an RpcResponder
 */
export const customHealthResponder = (healthResponses: SystemHealth[]) => {
  return (requestJSON: string): string => {
    const { id } = JSON.parse(requestJSON) as JsonRpcObject;
    const health = healthResponses.shift();
    if (!health) {
      throw new Error(NO_MORE_RESPONSES);
    }

    return systemHealthReponse(id, health);
  };
}

/**
 * respondWith - takes a sequence of JSON RPC response strings and returns
 * a function that when called with valid RPC request strings will return
 * the responses until it has iterated them all.
 *
 * @param jsonResponses - The sequence of responses
 * @returns an RpcResponder
 */
export const respondWith = (jsonResponses: string[]) => {
  return (_: string): string => {
    const mockResponse = jsonResponses.shift();
    if (!mockResponse) {
      throw new Error(NO_MORE_RESPONSES);
    }
    return mockResponse;
  };
}


/**
 * Fakes - these are the actual mock / spy implementations you will
 * create to use in place of a real instance of smoldot
 */


/**
 * createRequestProcessor - returns a function that mimics the behaviour of the
 * WASM light client by deferring a call to `jsonRpcCallback` after it is
 * called which returns the response returned by the supplied `responder`.
 *
 * If this is called with an rpc string containing the word subscribe (but not
 * unsubscribe), it is considered a subscription and `responder` must have 2
 * mock responses for each subscriptionrequest that the test will make.  The
 * first returning the subscription id.  The second a response to the
 * subscription.
 */
const createRequestProcessor = (options: SmoldotAddChainOptions, responder: RpcResponder, healthResponder: RpcResponder) => {
  return (rpcRequest: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    asap(() => {
      if (options && options.jsonRpcCallback) {
        if (/system_health/.test(rpcRequest)) {
          options.jsonRpcCallback(healthResponder(rpcRequest));
          return;
        }

        // non-health reponse
        options.jsonRpcCallback(responder(rpcRequest))
        if (/(?<!un)[sS]ubscribe/.test(rpcRequest)) {
          // FIXME: by convention it is assumed the responder has a queue of
          // responses setup so that a subscription response is immediately
          // followed by a single subscription message.  Subscriptions mocking
          // should be more flexible than this.
          options.jsonRpcCallback(responder(rpcRequest))
        }
      }
    });
  };
}

const doNothing = () => {
  // Do nothing
}

/**
 * mockSmoldot - creates a fake smoldot using the reponder and optional
 * healthResponder to orchestrate the responses it should reply with.
 *
 * @param responder - controls what responses to reply with for regular messages
 * and subscription messages.
 * @param healthResponder - controls what reponses to reply with for
 * "system_health" RPC requests
 */
export const mockSmoldot = (responder: RpcResponder, healthResponder = healthyResponder): Smoldot => {
  return {
    start: async (): Promise<SmoldotClient> => {
      return Promise.resolve({
        terminate: doNothing,
        addChain: async (options): Promise<SmoldotChain> => createAddChain({
          chainSpec: options.chainSpec,
          jsonRpcCallback: createRequestProcessor(options, responder, healthResponder)
        })
      });
    }
  };
};

export const createAddChain = (opts: { jsonRpcCallback: SmoldotJsonRpcCallback; chainSpec?: string; }): Promise<SmoldotChain> => {
  return Promise.resolve({
    sendJsonRpc: opts.jsonRpcCallback,
    remove: doNothing
  })
}

/**
 * spySmoldot - creates a fake smoldot using the reponder and optional
 * healthResponder to orchestrate the responses it should reply with that also
 * takes a spy so that you can inspect the calls that are made internally
 * to `sendJsonRpc`
 *
 * @param responder - controls what responses to reply with for regular messages
 * and subscription messages.
 * @param rpcSpy - a jest mock function to record the calls to `sendJsonRpc`
 * @param healthResponder - controls what reponses to reply with for
 * "system_health" RPC requests
 */
export const smoldotSpy = (responder: RpcResponder, rpcSpy: jest.MockedFunction<(rpc: string) => void>, healthResponder = healthyResponder): Smoldot => {
  return {
    start: async (): Promise<SmoldotClient> => {
      return Promise.resolve({
        terminate: doNothing,
        addChain: async (options: SmoldotAddChainOptions): Promise<SmoldotChain> => {
          const processRequest = createRequestProcessor(options, responder, healthResponder);
          return createAddChain({
            chainSpec: options.chainSpec,
            jsonRpcCallback: (rpc: string) => {
              rpcSpy(rpc);
              processRequest(rpc);
            }
          })
        }
      });
    }
  };
};

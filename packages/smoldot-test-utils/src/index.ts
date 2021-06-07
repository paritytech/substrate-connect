/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SmoldotClient, SmoldotOptions } from 'smoldot';
import { jest } from '@jest/globals'

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
 * Dev chains never have peers
 */
const devChainHealthResponse = (id: number) => {
  return systemHealthReponse(id, { isSyncing: true, peerCount: 0, shouldHavePeers: false});
}

/**
 * RpcResponder - an RpcResponder is a type representing a function that takes
 * a JSON string representing an RPC request and uses it to create a JSON RPC
 * response.
 */
type RpcResponder = (request: string) => string;

/**
 * healthyResponder - takes a JSON request that is expected to look like a valid
 * "system_health" RPC request and returns a valid matching healthy response. It
 * takes the ID from the request and ensures the response has the same ID.
 *
 * @param requestJSON
 * @returns a JSON string
 */
const healthyResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return systemHealthReponse(id, { isSyncing: false, peerCount: 1, shouldHavePeers: true });
}

/**
 * devChainHealthResponder - takes a JSON request that is expected to look like
 * a valid "system_health" RPC request and returns a valid matching healthy
 * response for a "dev chain". It takes the ID from the request and ensures the
 * response has the same ID.
 *
 * @param requestJSON
 * @returns a JSON string
 */
export const devChainHealthResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return devChainHealthResponse(id);
}

/**
 * unhealthyResponder - takes a JSON request that is expected to look like any
 * valid RPC request and and always generates an RPC error response.
 *
 * @param requestJSON
 * @returns a JSON string
 */
export const erroringResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return `{ "id": ${id}, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }`;
}


/**
 * Orchestrators - these are higher order factory functions take the
 * definitions of a sequence of reponses to respond with and returns
 * `RpcResponder` function that when called will return a reponse matching what
 * was supplied one-by-one
 */

const NO_MORE_RESPONSES = "json_rpc_callback was called but there are no mock responses left to respond with";

// Orchestrates a sequence of has peers / has no peers responses
export const customHealthResponder = (healthResponses: SystemHealth[]) => {
  return (requestJSON: string) => {
    const id = JSON.parse(requestJSON).id;
    const health = healthResponses.shift();
    if (!health) { 
      throw new Error(NO_MORE_RESPONSES); 
    }
    return systemHealthReponse(id, health);
  };
}

// Orchestrates an `RpcResponder` with a queue of mock reponses to respond with.
export const respondWith = (jsonResponses: string[]) => {
  return (_: string) => {
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


// Mimics the behaviour of the WASM light client by deferring a call to 
// `jsonRpcCallback` after it is called which returns the response
// returned by the supplied `responder`.
//
// If this is called with an rpc string containing the word subscribe (but not
// unsubscribe), it is considered a subscription and `responder` must have 2
// mock responses for each subscriptionrequest that the test will make.  The
// first returning the subscription id.  The second a response to the
// subscription.
const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder, healthResponder: RpcResponder) => {
  return (rpcRequest: string, chainIndex: number) => {
    process.nextTick(() => {
      if (options && options.jsonRpcCallback) {
        if (/system_health/.test(rpcRequest)) {
          options.jsonRpcCallback(healthResponder(rpcRequest), chainIndex);
          return;
        }

        // non-health reponse
        options.jsonRpcCallback(responder(rpcRequest), chainIndex)
        if (/(?<!un)[sS]ubscribe/.test(rpcRequest)) {
          options.jsonRpcCallback(responder(rpcRequest), chainIndex)
        }
      }
    });
  };
}

// Creates a fake smoldot. Calls to send use `fakeRpcSend` to mimic the light
// client behaviour
export const mockSmoldot = (responder: RpcResponder, healthResponder = healthyResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        terminate: () => {},
        // fake the async reply by using the reponder to format
        // a reply via options.jsonRpcCallback
        sendJsonRpc: fakeRpcSend(options, responder, healthResponder),
        cancelAll: () => {}
      });
    }
  };
};

// Creates a spying `smoldot` that records calls to `json_rpc_send` in `rpcSpy`
// and then uses `fakeRpcSend` to mimic the light client behaviour.
export const smoldotSpy = (responder: RpcResponder, rpcSpy: jest.MockedFunction<(rpc: string, chainIndex: number) => void>, healthResponder = healthyResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        terminate: () => {},
        sendJsonRpc: (rpc: string, chainIndex: number) => {
          // record the message call
          rpcSpy(rpc, chainIndex);
          // fake the async reply using the responder
          fakeRpcSend(options, responder, healthResponder)(rpc, chainIndex)
        },
        cancelAll: () => {}
      });
    }
  };
};


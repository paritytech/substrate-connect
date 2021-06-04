/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SmoldotClient, SmoldotOptions } from 'smoldot';

/**
 * Response builders - functions that simplify making RPC responses
 */

/**
 * systemHealthReponse - creates a valid RPC response that looks like a response
 * to a "system_health" RPC request using the supplied arguments
 *
 * @returns a JSON string
 */
const systemHealthReponse = (id: number, peerCount: number) => {
  return `{"jsonrpc":"2.0","id":${id} ,"result":{"isSyncing":true,"peers":${peerCount},"shouldHavePeers":true}}`;
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
  return `{"jsonrpc":"2.0","id":${id} ,"result":{"isSyncing":true,"peers":0,"shouldHavePeers":false}}`;
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
  return systemHealthReponse(id, 1);
}

/**
 * unhealthyResponder - takes a JSON request that is expected to look like a valid
 * "system_health" RPC request and returns a valid matching unhealthy response. It
 * takes the ID from the request and ensures the response has the same ID. The
 * response will say there are no peers.
 *
 * @param requestJSON
 * @returns a JSON string
 */
const unhealthyResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return systemHealthReponse(id, 0);
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

// ---

// Orchestrates a sequence of has peers / has no peers responses
export const customHealthResponder = (hasPeers: boolean[]) => {
  return (requestJSON: string) => {
    if (hasPeers.shift()) {
      return healthyResponder(requestJSON);
    } else {
      return unhealthyResponder(requestJSON);
    }
  };
}


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
export const smoldotSpy = (responder: RpcResponder, rpcSpy: any, healthResponder = healthyResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        terminate: () => {},
        sendJsonRpc: (rpc: string, chainIndex: number) => {
          // record the message call
          rpcSpy(rpc);
          // fake the async reply using the responder
          fakeRpcSend(options, responder, healthResponder)(rpc, chainIndex)
        },
        cancelAll: () => {}
      });
    }
  };
};

// Creates an `RpcResponder` with a queue of mock reponses to respond with.
export const respondWith = (jsonResponses: string[]) => {
  return (_: string) => {
    const mockResponse = jsonResponses.shift();
    if (!mockResponse) { 
      throw new Error("json_rpc_callback was called but there are no mock responses left to respond with"); 
    }
    return mockResponse;
  };
}

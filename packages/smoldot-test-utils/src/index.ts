/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SmoldotClient, SmoldotOptions } from 'smoldot';

type RpcResponder = (request: string) => string;

const systemHealthReponse = (id: number, peerCount: number) => {
  return `{"jsonrpc":"2.0","id":${id} ,"result":{"isSyncing":true,"peers":${peerCount},"shouldHavePeers":true}}`;
}

// Always responds to a health request with a response that has peers
const healthyResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return systemHealthReponse(id, 1);
}

// Always responds to a health request with a response that has no peers
const unhealthyResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return systemHealthReponse(id, 0);
}

// Always responds with an error reponse
export const erroringResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return `{ "id": ${id}, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }`;
}

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

// dev chains never have peers
const devChainHealthResponse = (id: number) => {
  return `{"jsonrpc":"2.0","id":${id} ,"result":{"isSyncing":true,"peers":0,"shouldHavePeers":false}}`;
}

export const devChainHealthResponder = (requestJSON: string) => {
  const id = JSON.parse(requestJSON).id;
  return devChainHealthResponse(id);

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
const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder, healthResponder: RpcResponder, chainIndex: number) => {
  return (rpcRequest: string) => {
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
        sendJsonRpc: fakeRpcSend(options, responder, healthResponder, 0),
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
        sendJsonRpc: (rpc: string) => {
          // record the message call
          rpcSpy(rpc);
          // fake the async reply using the responder
          fakeRpcSend(options, responder, healthResponder, 0)(rpc)
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

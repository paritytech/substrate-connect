import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"
import { createClient as makeSubstrateClient } from "@polkadot-api/substrate-client"
import * as Chainhead from "./chainhead"
import * as ChainSpec from "./chainSpec"
import { Effect, Scope, pipe as $, flow as _ } from "effect"

import { RPCClient } from "./types"

export const make = <E, R>(
  makeJsonRpcProvider: Effect.Effect<JsonRpcProvider, E, R | Scope.Scope>,
): Effect.Effect<RPCClient, E, R | Scope.Scope> => {
  return Effect.gen(function* () {
    const scope = yield* Effect.scope

    const substrateClient = yield* Effect.acquireRelease(
      $(makeJsonRpcProvider, Effect.andThen(makeSubstrateClient)),
      (client) =>
        $(
          Effect.try(() => client.destroy()),
          Effect.catchAll(() => Effect.void),
        ),
    ).pipe(Scope.extend(scope))

    return {
      chainSpec: yield* ChainSpec.make(substrateClient),
      chainhead: Chainhead.make(substrateClient),
    }
  })
}

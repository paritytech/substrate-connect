import type { SubstrateClient } from "@polkadot-api/substrate-client"
import * as Chainhead from "./chainhead"
import * as ChainSpec from "./chainSpec"
import { Effect, Scope } from "effect"

import { RPCClient } from "./types"

export const make = <E>(
  createSubstrateClient: Effect.Effect<SubstrateClient, E, Scope.Scope>,
): Effect.Effect<RPCClient, E, Scope.Scope> => {
  return Effect.gen(function* () {
    const scope = yield* Effect.scope

    const substrateClient = yield* Effect.acquireRelease(
      createSubstrateClient,
      (client) => Effect.sync(() => client.destroy()),
    ).pipe(Scope.extend(scope))

    return {
      chainSpec: yield* ChainSpec.make(substrateClient),
      chainhead: Chainhead.make(substrateClient),
    }
  })
}

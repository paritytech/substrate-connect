import * as bindings from "../bindings"
import * as smoldot from "smoldot"

import { Cause, Effect, pipe as $ } from "effect"
import { AddChainError, AlreadyDestroyedError, CrashError } from "../data"

export type AcquireOptions = smoldot.AddChainOptions & {
  client: bindings.client.Client
}

export const acquire = (
  options: AcquireOptions,
): Effect.Effect<
  bindings.chain.Chain,
  AddChainError | AlreadyDestroyedError | CrashError | Cause.UnknownException,
  never
> => {
  return Effect.gen(function* () {
    const { client, ...rest } = options
    const chain = yield* client.addChain(rest)

    return chain
  })
}

export const release = (chain: bindings.chain.Chain) =>
  $(
    chain.remove,
    Effect.catchTag("AlreadyDestroyedError", Effect.logWarning),
    Effect.catchAll(Effect.logError),
  )

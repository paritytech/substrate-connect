import * as smoldot from "smoldot"
import * as bindings from "./bindings"
import * as resources from "./resources"

import {
  Effect,
  Scope,
  pipe as $,
  HashMap,
  SynchronizedRef,
  Brand,
  Array,
  Ref,
  Exit,
  flow as _,
  Metric,
  ExecutionStrategy,
} from "effect"
import {
  Client,
  Chain,
  ClientOptions,
  ChainRefId,
  AddChainOptions,
} from "./types"

const restartSuccessCount = Metric.counter("smoldot/restart_successes", {
  description: "the number of times smoldot has restarted successfully",
  incremental: true,
})

const restartFailureCount = Metric.counter("smoldot/restart_failures", {
  description: "the number of times smoldot has failed to restart",
  incremental: true,
})

export const start = (
  options?: ClientOptions,
): Effect.Effect<Client, never, Scope.Scope> => {
  const Client = Brand.nominal<Client>()
  const Chain = Brand.nominal<Chain>()

  return Effect.gen(function* () {
    yield* Metric.incrementBy(restartSuccessCount, 0)
    yield* Metric.incrementBy(restartFailureCount, 0)

    const scope = yield* Scope.fork(
      yield* Effect.scope,
      ExecutionStrategy.sequential,
    )
    const ChainRefId = Brand.nominal<ChainRefId>()
    const nextChainRefId = yield* Ref.make<ChainRefId>(ChainRefId(0))
    const chainsMap = yield* SynchronizedRef.make(
      HashMap.empty<ChainRefId, bindings.chain.Chain>(),
    )

    const client = yield* $(
      Effect.acquireRelease(
        resources.client.acquire({
          ...options,
          logCallback,
        }),
        resources.client.release,
      ),
      Scope.extend(scope),
    )

    const addChain: Client["addChain"] = (options: AddChainOptions) => {
      return Effect.gen(function* () {
        const chainScope = yield* Scope.fork(
          scope,
          ExecutionStrategy.sequential,
        )

        return yield* SynchronizedRef.modifyEffect(chainsMap, (oldChains) =>
          Effect.gen(function* () {
            const potentialRelayChains = $(
              HashMap.values(oldChains),
              Array.fromIterable,
              Array.map(({ _original }) => _original),
            )

            const chainRefId = yield* $(
              nextChainRefId,
              Ref.updateAndGet((n) => ChainRefId(n + 1)),
            )

            const chain = yield* Effect.acquireRelease(
              resources.chain.acquire({
                ...options,
                potentialRelayChains,
                client,
              }),
              resources.chain.release,
            )

            const newChains = HashMap.set(oldChains, chainRefId, chain)

            const mappedChain = Chain({
              _refId: chainRefId,
              sendJsonRpc: chain.sendJsonRpc,
              nextJsonRpcResponse: chain.nextJsonRpcResponse,
              remove: Scope.close(chainScope, Exit.void),
            })

            return [mappedChain, newChains]
          }),
        ).pipe(Scope.extend(chainScope))
      })
    }

    const restart: Effect.Effect<Client, never, Scope.Scope> = $(
      $(
        Effect.logWarning("Smoldot is restarting..."),
        Effect.withLogSpan("smoldot"),
      ),
      Effect.tap(() => Scope.close(scope, Exit.void)),
      Effect.andThen(() => start(options)),
      Effect.tap(() =>
        $(
          Effect.log("Smoldot restarted successfully."),
          Effect.withLogSpan("smoldot"),
        ),
      ),
      Effect.tap(() => Metric.incrementBy(restartSuccessCount, 1)),
      Effect.tapError(() => Metric.incrementBy(restartFailureCount, 1)),
    )

    return Client({
      addChain,
      restart,
    })
  })
}

/** @internal */
const logCallback = (
  ...[level, target, message]: Parameters<smoldot.LogCallback>
): Effect.Effect<void, never, never> => {
  return Effect.gen(function* () {
    const log = (() => {
      switch (level) {
        case 1:
          return Effect.logError
        case 2:
          return Effect.logWarning
        case 3:
          return Effect.logInfo
        case 4:
          return Effect.logDebug
        case 5:
          return Effect.logTrace
        default:
          return Effect.log
      }
    })()
    yield* $(log(message), Effect.withLogSpan(target))
  })
}

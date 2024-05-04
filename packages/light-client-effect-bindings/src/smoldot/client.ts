import * as smoldot from "smoldot"

import {
  Effect,
  Runtime,
  Scope,
  pipe,
  Cause,
  HashMap,
  SynchronizedRef,
  Brand,
  Array,
  Ref,
} from "effect"
import { AddChainError, AlreadyDestroyedError, CrashError } from "./data"
import {
  Client,
  Chain,
  ClientOptions,
  ChainRefId,
  AddChainOptions,
} from "./types"
import { make as makeChain } from "./chain"

export const start = (
  options?: ClientOptions,
): Effect.Effect<Client, never, Scope.Scope> => {
  return Effect.gen(function* (_) {
    const runtime = yield* Effect.runtime<never>()
    const runSync = Runtime.runSync(runtime)
    const label = "smoldot/client"

    const acquire = pipe(
      Effect.sync(() =>
        smoldot.start({
          ...options,
          logCallback: (...args) => logCallback(...args).pipe(runSync),
        }),
      ),
      Effect.andThen(make),
      Effect.tap(() => Effect.log("started")),
      Effect.withLogSpan(label),
    )

    const release = (client: Client) =>
      Effect.gen(function* (_) {
        yield* Effect.addFinalizer(() =>
          client._terminate.pipe(Effect.catchAll(Effect.logError)),
        )
        yield* Effect.log("terminating")
      }).pipe(
        Effect.tap(() => Effect.log("terminated")),
        Effect.withLogSpan(label),
      )

    const client = yield* Effect.acquireRelease(acquire, release)

    return client
  })
}

/** @internal */
const make = (client: smoldot.Client) => {
  return Effect.gen(function* (_) {
    const scope = yield* Effect.scope
    const Client = Brand.nominal<Client>()
    const ChainRefId = Brand.nominal<ChainRefId>()
    const nextChainRefId = yield* Ref.make<ChainRefId>(ChainRefId(0))
    const chainsMap = yield* SynchronizedRef.make(
      HashMap.empty<ChainRefId, smoldot.Chain>(),
    )

    const acquireChain = (options: AddChainOptions) => {
      const Chain = Brand.nominal<Chain>()
      return SynchronizedRef.modifyEffect(chainsMap, (oldChains) =>
        Effect.gen(function* (_) {
          const potentialRelayChains = pipe(
            options.potentialRelayChains ?? [],
            Array.map((potentialRelayChain) =>
              HashMap.get(oldChains, potentialRelayChain._refId),
            ),
            Array.getSomes,
          )

          const chainRefId = yield* pipe(
            nextChainRefId,
            Ref.updateAndGet((n) => ChainRefId(n + 1)),
          )

          const chain = yield* Effect.tryPromise({
            try: () =>
              client.addChain({
                ...options,
                potentialRelayChains,
              }),
            catch: (err) => {
              if (err instanceof smoldot.AddChainError) {
                return new AddChainError()
              }
              if (err instanceof smoldot.AlreadyDestroyedError) {
                return new AlreadyDestroyedError()
              }
              if (err instanceof smoldot.CrashError) {
                return new CrashError()
              }

              return new Cause.UnknownException(err)
            },
          })

          const newChains = HashMap.set(oldChains, chainRefId, chain)

          const { remove, ...internalChain } = makeChain(chain)
          const mappedChain = Chain({
            ...internalChain,
            _refId: chainRefId,
            _chainSpec: options.chainSpec,
            _remove: remove,
          })

          return [mappedChain, newChains]
        }),
      )
    }

    const releaseChain = (chain: Chain) =>
      Effect.gen(function* (_) {
        yield* Effect.addFinalizer(() =>
          SynchronizedRef.update(chainsMap, (oldChains) =>
            HashMap.remove(oldChains, chain._refId),
          ),
        )
        yield* Effect.addFinalizer(() =>
          pipe(
            chain._remove,
            Effect.catchTag("AlreadyDestroyedError", Effect.logWarning),
            Effect.catchAll(Effect.logError),
            Effect.annotateLogs("refId", chain._refId),
            Effect.withLogSpan("smoldot/chain"),
          ),
        )
      }).pipe(Effect.scoped)

    const addChain: Client["addChain"] = (options: AddChainOptions) =>
      Effect.acquireRelease(acquireChain(options), releaseChain).pipe(
        Scope.extend(scope),
      )

    const terminate = Effect.tryPromise({
      try: () => client.terminate(),
      catch: (err) => {
        if (err instanceof smoldot.AlreadyDestroyedError) {
          return new AlreadyDestroyedError()
        }
        if (err instanceof smoldot.CrashError) {
          return new CrashError()
        }

        return new Cause.UnknownException(err)
      },
    })

    return Client({
      addChain,
      _terminate: terminate,
    })
  })
}

/** @internal */
const logCallback = (
  ...[level, target, message]: Parameters<smoldot.LogCallback>
): Effect.Effect<void, never, never> => {
  return Effect.gen(function* (_) {
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
    yield* log(message).pipe(Effect.withLogSpan(target))
  })
}

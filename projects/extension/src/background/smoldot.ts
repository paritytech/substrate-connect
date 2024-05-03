import {
  Cause,
  Console,
  Deferred,
  Effect,
  Fiber,
  HashMap,
  Array,
  Runtime,
  Schedule,
  SynchronizedRef,
  pipe,
  Duration,
} from "effect"
import {
  AlreadyDestroyedError,
  Client,
  ClientOptions,
  CrashError,
  JsonRpcDisabledError,
  start as startSmoldotClient,
} from "smoldot"
import { createClient as createSubstrateClient } from "@polkadot-api/substrate-client"
import { z } from "zod"
import {
  JsonRpcConnection,
  JsonRpcProvider,
} from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import { UnknownException } from "effect/Cause"

const chainSpecSchema = z.object({
  name: z.string(),
  id: z.string(),
  relay_chain: z.string().optional(),
})

const parseChainSpec = (chainSpec: string) => {
  return Effect.gen(function* (_) {
    const json = yield* Effect.try(() => JSON.parse(chainSpec))
    const parsed = yield* Effect.tryPromise(() =>
      chainSpecSchema.parseAsync(json),
    )

    return parsed
  })
}

type StartOptions = ClientOptions & {
  monitoring?: {
    restartCooldown?: Duration.DurationInput
    pollingInterval?: Duration.DurationInput
  }
}

export const start = (
  options: StartOptions,
): Effect.Effect<Client, never, never> => {
  const restartCooldown = options.monitoring?.restartCooldown ?? "10 seconds"
  const pollingInterval = options.monitoring?.pollingInterval ?? "5 seconds"

  return Effect.gen(function* (_) {
    const chainMonitorsRef = yield* SynchronizedRef.make(
      HashMap.empty<
        string,
        Fiber.Fiber<void, Cause.UnknownException | Cause.TimeoutException>
      >(),
    )

    const deferredClient = yield* Deferred.make<Client>()
    // always create smoldot on a separate fiber
    yield* Effect.forkDaemon(
      _(
        Effect.sync(() => startSmoldotClient(options)),
        Effect.andThen((client) => Deferred.succeed(deferredClient, client)),
        Effect.tap(() => Console.info("smoldot created successfully")),
        Effect.withSpan("smoldot/create"),
      ),
    )

    const clientRef = yield* _(
      Deferred.await(deferredClient),
      Effect.andThen(SynchronizedRef.make),
    )

    const isRestartingRef = yield* SynchronizedRef.make(false)
    const restart = SynchronizedRef.updateEffect(clientRef, (oldClient) =>
      Effect.gen(function* (_) {
        yield* Console.warn("restarting smoldot")
        yield* SynchronizedRef.updateEffect(chainMonitorsRef, (chainMonitors) =>
          Effect.gen(function* (_) {
            const fibers = Array.fromIterable(HashMap.values(chainMonitors))
            yield* Fiber.interruptAll(fibers)
            return HashMap.empty()
          }),
        ).pipe(Effect.tap(() => Console.log("chain monitors interrupted")))

        const newClient = yield* pipe(
          Effect.sync(() => startSmoldotClient(options)),
          Effect.tap(() => Console.log("smoldot restarted")),
        )
        yield* Effect.tryPromise({
          try: () => oldClient.terminate(),
          catch: (err) => {
            if (
              err instanceof AlreadyDestroyedError ||
              err instanceof CrashError
            ) {
              return err
            } else {
              return new UnknownException(err, "oldClient.terminate")
            }
          },
        }).pipe(
          // don't crash if already terminated
          Effect.catchAll(Console.error),
        )

        return newClient
      }),
    ).pipe(
      Effect.withSpan("smoldot/restart"),
      // always make sure restarts are on a separate fiber so the restart itself
      // isn't interrupted
      Effect.forkDaemon,
    )

    const tryRestart = SynchronizedRef.updateEffect(
      isRestartingRef,
      (isRestarting) =>
        Effect.gen(function* (_) {
          if (isRestarting) return true

          yield* Fiber.join(yield* restart)
          yield* _(
            Effect.sleep(restartCooldown),
            Effect.andThen(() => SynchronizedRef.set(isRestartingRef, false)),
          ).pipe(Effect.uninterruptible, Effect.forkDaemon)

          return true
        }),
    )

    const monitorChain = (
      options: Parameters<Client["addChain"]>[0] & { name: string },
    ) =>
      Effect.gen(function* (_) {
        const client = yield* clientRef.get
        const chain = yield* Effect.tryPromise(() => client.addChain(options))

        const runtime = yield* Effect.runtime<never>()
        const runPromise = Runtime.runPromise(runtime)

        const deferredOnMessage =
          yield* Deferred.make<(message: string) => void>()
        const deferredOnError = yield* Deferred.make<() => void>()

        const daemon = yield* Effect.fork(
          Effect.gen(function* (_) {
            const onMessage = yield* Deferred.await(deferredOnMessage)
            const onError = yield* Deferred.await(deferredOnError)

            yield* _(
              Effect.tryPromise({
                try: () => chain.nextJsonRpcResponse(),
                catch: (err) => {
                  if (
                    err instanceof CrashError ||
                    err instanceof JsonRpcDisabledError ||
                    err instanceof AlreadyDestroyedError
                  ) {
                    return err
                  }

                  return new UnknownException(err, "chain.nextJsonRpcResponse")
                },
              }),
              Effect.andThen((message) =>
                _(
                  Effect.try(() => onMessage(message)),
                  Effect.catchAll(() => Effect.void),
                ),
              ),
              Effect.catchAll(() =>
                Effect.gen(function* (_) {
                  yield* _(
                    Effect.try(() => onError()),
                    Effect.catchAll(() => Effect.void),
                  )
                  // Since we never call `chain.remove` ourselves, any error
                  // is considered a hard restart
                  return yield* tryRestart
                }),
              ),
              Effect.forever,
            )
          }),
        )

        const provider: JsonRpcProvider = getSyncProvider(
          async () => (onMessage, onError) => {
            runPromise(Deferred.succeed(deferredOnMessage, onMessage))
            runPromise(Deferred.succeed(deferredOnError, onError))

            const send: JsonRpcConnection["send"] = (message) => {
              chain.sendJsonRpc(message)
            }

            const disconnect: JsonRpcConnection["disconnect"] = () => {
              runPromise(Fiber.interrupt(daemon))
              chain.remove()
            }

            return {
              send,
              disconnect,
            }
          },
        )

        const substrateClient = yield* Effect.acquireRelease(
          Effect.try(() => createSubstrateClient(provider)),
          (client) =>
            Effect.try(() => client.destroy()).pipe(
              // ignore error if already destroyed
              Effect.catchAll(Console.error),
            ),
        )

        yield* pipe(
          Effect.tryPromise((abortSignal) =>
            substrateClient.request(
              "chainSpec_v1_genesisHash",
              [],
              abortSignal,
            ),
          ),
          Effect.andThen(() => Console.debug(`heartbeat: ${options.name}`)),
        ).pipe(
          Effect.repeat(
            Schedule.addDelay(Schedule.forever, () => pollingInterval),
          ),
        )
      }).pipe(Effect.scoped)

    const tryMonitorChain = (options: Parameters<Client["addChain"]>[0]) =>
      Effect.gen(function* (_) {
        if (options.disableJsonRpc) {
          return
        }

        const chainSpec = yield* parseChainSpec(options.chainSpec)
        if (HashMap.has(yield* chainMonitorsRef.get, chainSpec.id)) return

        yield* SynchronizedRef.getAndUpdateEffect(
          chainMonitorsRef,
          (chainIds) =>
            Effect.gen(function* (_) {
              const daemon = yield* Effect.forkDaemon(
                monitorChain({ ...options, name: chainSpec.name }),
              )
              return HashMap.set(chainIds, chainSpec.id, daemon)
            }),
        )
      })

    const runtime = yield* Effect.runtime<never>()
    const runPromise = Runtime.runPromise(runtime)

    const addChain: Client["addChain"] = (options) =>
      Effect.gen(function* (_) {
        yield* Effect.fork(tryMonitorChain(options))

        return yield* _(
          clientRef.get,
          Effect.andThen((client) =>
            Effect.tryPromise(() => client.addChain(options)),
          ),
        )
      }).pipe(runPromise)

    const terminate: Client["terminate"] = () =>
      Effect.gen(function* (_) {
        const client = yield* clientRef.get
        return yield* Effect.tryPromise(() => client.terminate())
      }).pipe(runPromise)

    return {
      addChain,
      terminate,
    }
  })
}

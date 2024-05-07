import * as smoldot from "../smoldot"

import type {
  JsonRpcConnection,
  JsonRpcProvider,
} from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import {
  Cause,
  Context,
  Effect,
  Exit,
  Fiber,
  pipe as $,
  Runtime,
  Schedule,
  Scope,
  SynchronizedRef,
  Queue,
  Stream,
  Sink,
  PubSub,
} from "effect"

export class SmoldotClient extends Context.Tag("SmoldotClient")<
  SmoldotClient,
  SynchronizedRef.SynchronizedRef<smoldot.Client>
>() {}

export const make = (
  options: smoldot.AddChainOptions,
): Effect.Effect<
  JsonRpcProvider,
  | smoldot.AddChainError
  | smoldot.AlreadyDestroyedError
  | smoldot.CrashError
  | Cause.UnknownException,
  SmoldotClient | Scope.Scope
> => {
  return Effect.gen(function* () {
    const runtime = yield* Effect.runtime<never>()
    const runCallback = Runtime.runCallback(runtime)
    const runPromise = Runtime.runPromise(runtime)

    const readySignal = yield* Queue.sliding<void>(1)
    const messageQueue = yield* PubSub.unbounded<string>()
    const errorPubSub = yield* PubSub.sliding<void>(1)

    //#region Validate Add Chain Options
    const validateScope = yield* Scope.make()
    const chainRef: SynchronizedRef.SynchronizedRef<smoldot.Chain> = yield* $(
      SmoldotClient,
      Effect.andThen(SynchronizedRef.get),
      Effect.andThen((client) =>
        client.addChain(options).pipe(Scope.extend(validateScope)),
      ),
      Effect.andThen(SynchronizedRef.make),
    )
    //#endregion

    //#region JSON RPC Daemon
    const daemon = yield* Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Queue.takeAll(readySignal))
      yield* Effect.addFinalizer(() => PubSub.publish(errorPubSub, undefined))

      const smoldotClient = yield* $(
        SmoldotClient,
        Effect.andThen(SynchronizedRef.get),
      )

      const chain = yield* SynchronizedRef.updateAndGetEffect(chainRef, () =>
        smoldotClient.addChain(options),
      )
      yield* Scope.close(validateScope, Exit.void)

      // wait until the message queue is flushed
      yield* $(
        Effect.void,
        Effect.repeat({
          until: () => Queue.isEmpty(messageQueue),
          schedule: Schedule.forever,
        }),
      )

      yield* Queue.offer(readySignal, undefined)

      yield* $(
        chain.nextJsonRpcResponse,
        Effect.tap((message) =>
          $(
            Queue.offer(messageQueue, message),
            Effect.tap(() => Effect.logDebug(message)),
          ),
        ),
        Effect.tapErrorTag("AlreadyDestroyedError", () => Effect.void),
        Effect.tapErrorTag("JsonRpcDisabledError", () =>
          $(
            Effect.logWarning("JSON RPC disabled."),
            Effect.andThen(Effect.interrupt),
          ),
        ),
        Effect.tapErrorTag("CrashError", () =>
          Effect.logWarning("Smoldot has crashed."),
        ),
        Effect.tapErrorTag("UnknownException", (e) => Effect.logError(e)),
        Effect.forever,
      )
    }).pipe(
      Effect.scoped,
      Effect.retry(
        $(
          Schedule.spaced("1 second"),
          Schedule.jitteredWith({ min: 0.8, max: 1.5 }),
        ),
      ),
      Effect.onExit(() => Effect.log("Daemon has stopped.")),
      Effect.scoped,
      Effect.forkScoped,
      Effect.interruptible,
    )
    //#endregion

    //#region JSON RPC Provider
    const provider: JsonRpcProvider = yield* Effect.sync(() =>
      getSyncProvider(async () => {
        await runPromise(
          $(
            Queue.take(readySignal),
            Effect.tap(() => Effect.log("JSON RPC provider initialized.")),
          ),
        )

        return (onMessage, onError) => {
          const onExit = <A, E>(exit: Exit.Exit<A, E>) => {
            return Exit.isFailure(exit) && onError()
          }

          runCallback(
            Effect.gen(function* () {
              const errorSubscription = yield* PubSub.subscribe(errorPubSub)
              const messageStream = yield* PubSub.subscribe(messageQueue)

              yield* $(
                Stream.fromQueue(messageStream),
                Stream.run(
                  Sink.forEach((message) =>
                    $(
                      Effect.try(() => onMessage(message)),
                      Effect.catchAll(() => Effect.void),
                      Effect.catchAllDefect((err) =>
                        $(
                          Effect.logError(err),
                          Effect.withLogSpan("onMessage"),
                        ),
                      ),
                    ),
                  ),
                ),
                Effect.repeat({
                  while: () => Queue.isEmpty(errorSubscription),
                  schedule: Schedule.forever,
                }),
              )
            }).pipe(Effect.scoped, Effect.forkDaemon),
            { onExit },
          )

          runCallback(
            Effect.gen(function* () {
              const errorSubscription = yield* PubSub.subscribe(errorPubSub)

              yield* Queue.take(errorSubscription)

              yield* $(
                Effect.try(() => onError()),
                Effect.catchAll(() => Effect.void),
              )
            }).pipe(Effect.scoped, Effect.forkDaemon),
            { onExit },
          )

          const send: JsonRpcConnection["send"] = (message) => {
            runCallback(
              $(
                chainRef.get,
                Effect.andThen((chain) => chain.sendJsonRpc(message)),
                Effect.tap(() => Effect.logDebug(message)),
              ),
              {
                onExit,
              },
            )
          }

          const disconnect: JsonRpcConnection["disconnect"] = () => {
            runCallback(
              $(
                Fiber.interrupt(daemon),
                Effect.tap(() => Effect.log("JSON RPC provider disconnected.")),
              ),
              { onExit },
            )
          }

          return {
            send,
            disconnect,
          }
        }
      }),
    )
    //#endregion

    return provider
  }).pipe(Effect.withLogSpan("json-rpc-provider"))
}

import type * as smoldot from "../smoldot"

import type {
  JsonRpcConnection,
  JsonRpcProvider,
} from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import {
  Cause,
  Effect,
  Exit,
  Fiber,
  pipe as $,
  Runtime,
  Schedule,
  SynchronizedRef,
  Queue,
  Stream,
  Sink,
  PubSub,
} from "effect"

export type Client = Pick<smoldot.Client, "addChain">
export type AddChainOptions = smoldot.AddChainOptions

export const make = (
  client: Client,
  options: AddChainOptions,
): Effect.Effect<JsonRpcProvider, Cause.UnknownException, never> => {
  return Effect.gen(function* () {
    const readySignal = yield* Queue.sliding<void>(1)
    const messagePubSub = yield* PubSub.unbounded<string>()
    const errorPubSub = yield* PubSub.sliding<void>(1)

    const addChain = Effect.tryPromise(() => client.addChain(options))

    const chainRef = yield* $(addChain, Effect.andThen(SynchronizedRef.make))

    //#region JSON RPC Daemon
    const daemon = yield* Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Queue.takeAll(readySignal))
      yield* Effect.addFinalizer(() => PubSub.publish(errorPubSub, undefined))

      const chain = yield* SynchronizedRef.updateAndGetEffect(
        chainRef,
        (oldChain) =>
          addChain.pipe(
            Effect.tap(() =>
              $(
                Effect.try(() => oldChain.remove()),
                Effect.catchAll(() => Effect.void),
              ),
            ),
          ),
      )

      // wait until the message queue is flushed
      yield* $(
        Effect.void,
        Effect.repeat({
          until: () => Queue.isEmpty(messagePubSub),
          schedule: Schedule.forever,
        }),
      )

      yield* Queue.offer(readySignal, undefined)

      yield* $(
        Effect.tryPromise(() => chain.nextJsonRpcResponse()),
        Effect.tap((message) =>
          $(
            Queue.offer(messagePubSub, message),
            Effect.tap(() => Effect.logDebug(message)),
          ),
        ),
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
      Effect.forkDaemon,
      Effect.interruptible,
    )
    //#endregion

    //#region JSON RPC Provider
    const runtime = yield* Effect.runtime<never>()
    const runCallback = Runtime.runCallback(runtime)
    const runPromise = Runtime.runPromise(runtime)

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
              const messageStream = yield* PubSub.subscribe(messagePubSub)

              yield* $(
                Stream.fromQueue(messageStream),
                Stream.run(
                  Sink.forEach((message) =>
                    $(
                      Effect.try(() => onMessage(message)),
                      Effect.catchAll(() => Effect.void),
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

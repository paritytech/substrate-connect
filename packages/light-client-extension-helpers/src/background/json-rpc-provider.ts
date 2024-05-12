import type * as smoldot from "../smoldot"

import type {
  JsonRpcConnection,
  JsonRpcProvider,
} from "@polkadot-api/json-rpc-provider"
import { getSyncProvider } from "@polkadot-api/json-rpc-provider-proxy"
import {
  Cause,
  Effect,
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
    const runtime = yield* Effect.runtime<never>()
    const runCallback = Runtime.runCallback(runtime)
    const runPromise = Runtime.runPromise(runtime)

    const readySignal = yield* Queue.sliding<void>(1)
    const messagePubSub = yield* PubSub.unbounded<string>()
    const errorPubSub = yield* PubSub.sliding<void>(1)

    const chainRef = yield* $(
      Effect.tryPromise(() => client.addChain(options)),
      Effect.andThen(SynchronizedRef.make),
    )

    const daemon = yield* Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Queue.takeAll(readySignal))
      yield* Effect.addFinalizer(() => PubSub.publish(errorPubSub, undefined))

      const chain = yield* SynchronizedRef.updateAndGetEffect(
        chainRef,
        (oldChain) =>
          $(
            Effect.tryPromise(() => client.addChain(options)),
            Effect.tap(() =>
              $(
                Effect.try(() => oldChain.remove()),
                Effect.catchAll(() => Effect.void),
              ),
            ),
          ),
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
      Effect.forkDaemon,
      Effect.interruptible,
    )

    const provider: JsonRpcProvider = yield* Effect.sync(() =>
      getSyncProvider(async () => {
        await $(
          Queue.take(readySignal),
          Effect.tap(() => Effect.log("JSON RPC provider initialized.")),
          runPromise,
        )

        return (onMessage, onError) => {
          runCallback(
            Effect.gen(function* () {
              const errorStream = yield* PubSub.subscribe(errorPubSub)
              const messageStream = yield* PubSub.subscribe(messagePubSub)

              const propagateMessages = $(
                Stream.fromQueue(messageStream),
                Stream.run(
                  Sink.forEach((message) =>
                    $(
                      Effect.try(() => onMessage(message)),
                      Effect.catchAll(() => Effect.void),
                    ),
                  ),
                ),
              )

              yield* $(
                propagateMessages,
                Effect.repeat({
                  while: () => Queue.isEmpty(errorStream),
                  schedule: Schedule.forever,
                }),
              )
            }).pipe(Effect.scoped, Effect.forkDaemon),
          )

          runCallback(
            Effect.gen(function* () {
              const waitForFirstError = $(
                PubSub.subscribe(errorPubSub),
                Effect.andThen((errorMessages) => Queue.take(errorMessages)),
              )
              const notifySubscribers = $(
                Effect.try(() => onError()),
                Effect.catchAll(() => Effect.void),
              )

              yield* $(
                waitForFirstError,
                Effect.andThen(() => notifySubscribers),
              )
            }).pipe(Effect.scoped, Effect.forkDaemon),
          )

          const send: JsonRpcConnection["send"] = (message) => {
            runCallback(
              $(
                chainRef.get,
                Effect.andThen((chain) => chain.sendJsonRpc(message)),
                Effect.tap(() => Effect.logDebug(message)),
              ),
            )
          }

          const disconnect: JsonRpcConnection["disconnect"] = () => {
            runCallback(
              $(
                Fiber.interrupt(daemon),
                Effect.tap(() => Effect.log("JSON RPC provider disconnected.")),
              ),
            )
          }

          return {
            send,
            disconnect,
          }
        }
      }),
    )

    return provider
  }).pipe(Effect.withLogSpan("json-rpc-provider"))
}

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

/**
 * Creates a new JSON RPC provider using a client and options.
 *
 * This provider will automatically re-connect to the chain if the
 * connection is lost.
 *
 * @param client - The client to use for creating the provider.
 * @param options - The options for adding a chain.
 */
export const make = (
  client: Client,
  options: AddChainOptions,
): Effect.Effect<JsonRpcProvider, Cause.UnknownException, never> => {
  return Effect.gen(function* () {
    const runtime = yield* Effect.runtime<never>()
    const runCallback = Runtime.runCallback(runtime)
    const runPromise = Runtime.runPromise(runtime)

    /**
     * This is a special single-element queue that signals when the daemon is
     * ready. It is cleared every time the daemon restarts. While a `Deferred`
     *  would typically be used in this situation, the ability of the daemon
     * to restart requires a queue that can be cleared and reused.
     */
    const daemonReadySignal = yield* Queue.sliding<void>(1)

    /**
     * A message pubsub for the daemon to publish JSON RPC messages to.
     * It is the responsibility of the JSON RPC provider to consume these
     * messages and propagate them with the onMessage callback.
     */
    const messagePubSub = yield* PubSub.unbounded<string>()

    /**
     * An error pubsub for the daemon to publish errors to.
     * It is the responsibility of the JSON RPC provider to consume these
     *  errors and propagate them with the onError callback.
     */
    const errorPubSub = yield* PubSub.sliding<void>(1)

    /**
     * A synchronized reference to the current chain. This reference is updated
     * every time the daemon restarts.
     *
     */
    const chainRef = yield* $(
      Effect.tryPromise(() => client.addChain(options)),
      Effect.andThen(SynchronizedRef.make),
    )

    /**
     * This daemon process listens for JSON RPC messages, publishing them to
     * the message pubsub. It also detects errors and publishes those to the
     * error pubsub.
     *
     * If an error occurs with `chain.nextJsonRpcResponse()`, the daemon
     * restarts. This indicates that the chain is no longer functional.
     * In response, the daemon reconnects to smoldot using the same
     * `AddChainParameters` to obtain a new `Chain` object.
     */
    const daemon = yield* Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Queue.takeAll(daemonReadySignal))
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

      // chain is initialized so we can signal that the daemon is ready
      yield* Queue.offer(daemonReadySignal, undefined)

      yield* $(
        Effect.tryPromise(() => chain.nextJsonRpcResponse()),
        Effect.tap(Effect.logDebug),
        Effect.tap((message) => Queue.offer(messagePubSub, message)),
      ).pipe(Effect.forever)
    }).pipe(
      // by scoping here, we ensure the finalizers are run before the next retry
      Effect.scoped,
      Effect.retry(Schedule.spaced("1 second")),
      Effect.forkDaemon,
      Effect.interruptible,
    )

    const provider: JsonRpcProvider = yield* Effect.sync(() =>
      getSyncProvider(async () => {
        await $(
          Queue.take(daemonReadySignal),
          Effect.tap(() => Effect.log("JSON RPC provider initialized.")),
          runPromise,
        )

        return (onMessage, onError) => {
          const invokeOnMessageCallback = (message: string) =>
            $(
              Effect.try(() => onMessage(message)),
              Effect.catchAll(() => Effect.void),
            )

          const invokeOnErrorCallback = $(
            Effect.try(() => onError()),
            Effect.catchAll(() => Effect.void),
          )

          runCallback(
            // Daemon process to propagate messages from the message queue
            // to the onMessage callback until the first error.
            Effect.gen(function* () {
              const errorStream = yield* PubSub.subscribe(errorPubSub)
              const messageStream = yield* PubSub.subscribe(messagePubSub)

              yield* $(
                Stream.fromQueue(messageStream),
                Stream.run(Sink.forEach(invokeOnMessageCallback)),
              ).pipe(
                Effect.repeat({
                  while: () => Queue.isEmpty(errorStream),
                  schedule: Schedule.forever,
                }),
              )
            }).pipe(Effect.scoped, Effect.forkDaemon),
          )

          runCallback(
            // Daemon process that waits for the first error and then invokes
            // the onError callback.
            PubSub.subscribe(errorPubSub).pipe(
              Effect.andThen((errorMessages) => Queue.take(errorMessages)),
              Effect.andThen(() => invokeOnErrorCallback),
              Effect.scoped,
              Effect.forkDaemon,
            ),
          )

          const send: JsonRpcConnection["send"] = (message) => {
            runCallback(
              Effect.gen(function* () {
                yield* Effect.logDebug(message)

                yield* $(
                  chainRef.get,
                  Effect.andThen((chain) =>
                    Effect.try(() => chain.sendJsonRpc(message)),
                  ),
                  Effect.catchAll(() => invokeOnErrorCallback),
                )
              }),
            )
          }

          const disconnect: JsonRpcConnection["disconnect"] = () => {
            runCallback(
              Effect.gen(function* () {
                yield* Fiber.interrupt(daemon)

                yield* Effect.log("JSON RPC provider disconnected.")
              }),
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

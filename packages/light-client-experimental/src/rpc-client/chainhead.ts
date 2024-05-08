import type * as SubstrateClient from "@polkadot-api/substrate-client"
import * as S from "@effect/schema/Schema"

import {
  Option,
  Effect,
  Deferred,
  Runtime,
  pipe as $,
  flow as _,
  Fiber,
  Schedule,
  Cause,
  Scope,
  Ref,
} from "effect"
import { InvalidJSONRPCResponseError } from "./errors"

export type ChainHeadRPC = {
  finalizedDatabase: (params?: {
    maxSizeBytes?: number
  }) => Effect.Effect<
    string,
    InvalidJSONRPCResponseError | Cause.UnknownException,
    never
  >
}

/** @internal */
export type Client = Omit<
  SubstrateClient.SubstrateClient,
  "transaction" | "_request" | "destroy"
>

/** @internal */
export const make = (
  client: Client,
): Effect.Effect<ChainHeadRPC, never, Scope.Scope> => {
  return Effect.gen(function* () {
    const chainHeadSubscription = yield* Ref.make(
      Option.none<SubstrateClient.FollowResponse>(),
    )

    const subscriptionDaemon = yield* Effect.gen(function* () {
      yield* Effect.addFinalizer(() =>
        Effect.gen(function* () {
          yield* Ref.set(chainHeadSubscription, Option.none())
          yield* Effect.log("Chainhead disconnected")
        }),
      )

      const runtime = yield* Effect.runtime<never>()
      const runPromise = Runtime.runPromise(runtime)

      const initializedSignal = yield* Deferred.make<void>()
      const exitSignal = yield* Deferred.make<Error>()

      const subscription: SubstrateClient.FollowResponse =
        yield* Effect.acquireRelease(
          Effect.try(() =>
            client.chainHead(
              true,
              () => {
                runPromise(Deferred.succeed(initializedSignal, undefined))
              },
              (err) => {
                runPromise(Deferred.succeed(exitSignal, err))
              },
            ),
          ),
          (followResponse) =>
            $(
              Effect.sync(() => followResponse.unfollow()),
              Effect.catchAll(() => Effect.void),
            ),
        )

      yield* Effect.raceWith(
        Deferred.await(initializedSignal),
        Deferred.await(exitSignal),
        {
          onSelfDone: () =>
            Effect.gen(function* () {
              yield* Ref.set(chainHeadSubscription, Option.some(subscription))
              yield* Effect.log("Chainhead connected")
            }),
          onOtherDone: () => Effect.void,
        },
      )

      const err = yield* Deferred.await(exitSignal)
      yield* Effect.logError(err, err.message)
      yield* Effect.fail("Chainhead interrupted")
    }).pipe(
      Effect.scoped,
      Effect.retry(
        $(
          Schedule.union(
            Schedule.exponential("500 millis"),
            Schedule.spaced("5 seconds"),
          ),
          Schedule.jittered,
        ),
      ),
      Effect.catchAll(() => Effect.never),
      Effect.fork,
    )

    yield* Effect.addFinalizer(() => Fiber.interrupt(subscriptionDaemon))

    const waitForChainHead = $(
      Ref.get(chainHeadSubscription),
      Effect.flatten,
      Effect.onError(() => Effect.yieldNow()),
      Effect.retry({ schedule: Schedule.forever }),
      Effect.catchAll(() => Effect.never),
    )

    const finalizedDatabase: ChainHeadRPC["finalizedDatabase"] = ({
      maxSizeBytes,
    } = {}) =>
      $(
        waitForChainHead,
        Effect.andThen(() =>
          Effect.tryPromise((signal) =>
            client.request(
              "chainHead_unstable_finalizedDatabase",
              maxSizeBytes ? [maxSizeBytes] : [],
              signal,
            ),
          ),
        ),
        Effect.andThen(
          _(
            S.decodeUnknown(S.String),
            Effect.mapError(
              (err) => new InvalidJSONRPCResponseError({ cause: err }),
            ),
          ),
        ),
        Effect.withSpan("chainHead/unstable/finalizedDatabase"),
      )

    return {
      finalizedDatabase,
    }
  }).pipe(Effect.withLogSpan("chainhead"))
}

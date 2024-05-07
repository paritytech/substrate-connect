import {
  Cause,
  Duration,
  Effect,
  Logger,
  LogLevel,
  pipe as $,
  flow as _,
  Schedule,
  SynchronizedRef,
  Runtime,
} from "effect"
import { NodeRuntime } from "@effect/platform-node"
import {
  polkadot,
  westend2,
  ksmcc3,
  polkadot_asset_hub,
  ksmcc3_asset_hub,
  westend2_asset_hub,
} from "@substrate/connect-known-chains"
import { PrettyLogger } from "effect-log"
import * as Smoldot from "@substrate/light-client-experimental/smoldot"
import {
  make as makeJsonRpcProvider,
  SmoldotClient,
} from "@substrate/light-client-experimental/json-rpc-provider"
import { createClient as createSubstrateClient } from "@polkadot-api/substrate-client"
import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"
import { config } from "rxjs"

const logger = PrettyLogger.layer({
  showFiberId: true,
  showTime: true,
  showSpans: true,
  enableColors: true,
})

const main = Effect.gen(function* (_) {
  const runtime = yield* Effect.runtime<never>()
  const runSync = Runtime.runSync(runtime)
  yield* Effect.sync(() => {
    config.onUnhandledError = (err) =>
      runSync(
        $(Effect.logError(err), Effect.withLogSpan("rxjs-unhandled-error")),
      )
  })

  const smoldotRef = yield* SynchronizedRef.make(
    yield* Smoldot.start({ maxLogLevel: 4 }),
  )

  const createClient = (provider: JsonRpcProvider) =>
    Effect.acquireRelease(
      Effect.try(() => $(provider, createSubstrateClient)),
      (client) =>
        $(
          Effect.try(() => client.destroy()),
          Effect.catchAll(() => Effect.void),
        ),
    )

  const fiber = yield* Effect.gen(function* (_) {
    const polkadotClient = yield* $(
      makeJsonRpcProvider({ chainSpec: polkadot }),
      Effect.andThen(createClient),
      Effect.withLogSpan("polkadot"),
      Effect.withSpan("polkadot"),
    )

    const westendClient = yield* $(
      makeJsonRpcProvider({ chainSpec: westend2 }),
      Effect.andThen(createClient),
      Effect.withLogSpan("westend"),
      Effect.withSpan("westend"),
    )
    const ksmClient = yield* $(
      makeJsonRpcProvider({ chainSpec: ksmcc3 }),
      Effect.andThen(createClient),
      Effect.withLogSpan("ksmcc3"),
      Effect.withSpan("ksmcc3"),
    )

    const polkadotAssetHubClient = yield* $(
      makeJsonRpcProvider({ chainSpec: polkadot_asset_hub }),
      Effect.andThen(createClient),
      Effect.withLogSpan("polkadot-asset-hub"),
      Effect.withSpan("polkadot-asset-hub"),
    )

    const westendAssetHubClient = yield* $(
      makeJsonRpcProvider({ chainSpec: westend2_asset_hub }),
      Effect.andThen(createClient),
      Effect.withLogSpan("westend-asset-hub"),
      Effect.withSpan("westend-asset-hub"),
    )

    const kscmc3AssetHubClient = yield* $(
      makeJsonRpcProvider({ chainSpec: ksmcc3_asset_hub }),
      Effect.andThen(createClient),
      Effect.withLogSpan("kusama-asset-hub"),
      Effect.withSpan("kusama-asset-hub"),
    )

    yield* Effect.void.pipe(Effect.forever)
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.fork,
    Effect.provideService(SmoldotClient, smoldotRef),
  )

  yield* Effect.sleep(Duration.seconds(5))
  yield* SynchronizedRef.updateEffect(
    smoldotRef,
    (oldSmoldot) => oldSmoldot.restart,
  ).pipe(Effect.repeat(Schedule.exponential(Duration.seconds(15))))

  yield* Effect.void.pipe(Effect.forever)
}).pipe(
  Effect.tapErrorCause((cause) => Effect.logError(Cause.pretty(cause))),
  Effect.tapDefect((cause) => Effect.logFatal(Cause.pretty(cause))),
  Logger.withMinimumLogLevel(LogLevel.Info),
  Effect.provide(logger),
  Effect.scoped,
)

NodeRuntime.runMain(main, { disableErrorReporting: true })

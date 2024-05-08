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
  Deferred,
  Console,
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
import { make as makeRPCClient } from "@substrate/light-client-experimental/rpc-client"
import { createClient as createSubstrateClient } from "@polkadot-api/substrate-client"
import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"

const logger = PrettyLogger.layer({
  showFiberId: true,
  showTime: true,
  showSpans: true,
  enableColors: true,
})

const main = Effect.gen(function* (_) {
  const smoldotRef = yield* SynchronizedRef.make(
    yield* Smoldot.start({ maxLogLevel: 4 }),
  )

  const deferredChainheadConnect = yield* Deferred.make()

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
      Effect.map(createClient),
      Effect.andThen(makeRPCClient),
      Effect.withLogSpan("polkadot"),
      Effect.withSpan("polkadot"),
    )

    const westendClient = yield* $(
      makeJsonRpcProvider({ chainSpec: westend2 }),
      Effect.map(createClient),
      Effect.andThen(makeRPCClient),
      Effect.withLogSpan("westend"),
      Effect.withSpan("westend"),
    )
    const ksmClient = yield* $(
      makeJsonRpcProvider({ chainSpec: ksmcc3 }),
      Effect.map(createClient),
      Effect.andThen(makeRPCClient),
      Effect.withLogSpan("ksmcc3"),
      Effect.withSpan("ksmcc3"),
    )

    const polkadotAssetHubClient = yield* $(
      makeJsonRpcProvider({ chainSpec: polkadot_asset_hub }),
      Effect.map(createClient),
      Effect.andThen(makeRPCClient),
      Effect.withLogSpan("polkadot-asset-hub"),
      Effect.withSpan("polkadot-asset-hub"),
    )

    const westendAssetHubClient = yield* $(
      makeJsonRpcProvider({ chainSpec: westend2_asset_hub }),
      Effect.map(createClient),
      Effect.andThen(makeRPCClient),
      Effect.withLogSpan("westend-asset-hub"),
      Effect.withSpan("westend-asset-hub"),
    )

    const kscmc3AssetHubClient = yield* $(
      makeJsonRpcProvider({ chainSpec: ksmcc3_asset_hub }),
      Effect.map(createClient),
      Effect.andThen(makeRPCClient),
      Effect.withLogSpan("kusama-asset-hub"),
      Effect.withSpan("kusama-asset-hub"),
    )

    const chainName = yield* polkadotClient.chainSpec.chainName

    yield* Effect.log(yield* polkadotClient.chainSpec.genesisHash)
    yield* Effect.log(yield* polkadotClient.chainSpec.chainName)
    yield* Effect.log(yield* polkadotClient.chainSpec.properties)

    const massSubscribe = [
      $(polkadotClient.chainhead, Effect.withLogSpan(chainName.toLowerCase())),
    ]

    for (let i = 0; i < 10; i++) {
      massSubscribe.push(
        $(
          polkadotClient.chainhead,
          Effect.withLogSpan(chainName.toLowerCase()),
          Effect.delay(i * 1000),
        ),
      )
    }

    yield* Console.log(massSubscribe.length)

    yield* Effect.all(massSubscribe, { concurrency: "unbounded" })

    /*     const chainheadSubscription = yield* $(
      polkadotClient.chainhead,
      Effect.withLogSpan(chainName.toLowerCase()),
    )
    yield* chainheadSubscription.finalizedDatabase({
      maxSizeBytes: 1024 * 1024,
    })

    yield* Effect.log("Dumped")

    yield* Deferred.succeed(deferredChainheadConnect, undefined) */

    yield* $(Effect.yieldNow(), Effect.forever)
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.fork,
    Effect.provideService(SmoldotClient, smoldotRef),
  )

  yield* Deferred.await(deferredChainheadConnect)

  yield* Effect.sleep(Duration.seconds(5))
  /*   yield* SynchronizedRef.updateEffect(
    smoldotRef,
    (oldSmoldot) => oldSmoldot.restart,
  ) */

  yield* $(Effect.yieldNow(), Effect.forever)
}).pipe(
  Effect.tapErrorCause((cause) => Effect.logError(Cause.pretty(cause))),
  Effect.tapDefect((cause) => Effect.logFatal(Cause.pretty(cause))),
  Logger.withMinimumLogLevel(LogLevel.Info),
  Effect.provide(logger),
  Effect.scoped,
)

NodeRuntime.runMain(main, { disableErrorReporting: true })

import { Cause, Console, Effect, Exit, Fiber, Scope } from "effect"
import { NodeRuntime } from "@effect/platform-node"
import { polkadot, westend2, ksmcc3 } from "@substrate/connect-known-chains"
import { PrettyLogger } from "effect-log"
import * as Smoldot from "@substrate/light-client-effect-bindings/smoldot"

const logger = PrettyLogger.layer({
  showFiberId: true,
  showTime: true,
  showSpans: true,
  enableColors: true,
})

const main = Effect.gen(function* (_) {
  const smoldot = yield* Smoldot.start({ maxLogLevel: 3 })

  const fiber = yield* Effect.gen(function* (_) {
    const chain1 = yield* smoldot.addChain({ chainSpec: polkadot })
    const chain2 = yield* smoldot.addChain({ chainSpec: westend2 })
    const chain3 = yield* smoldot.addChain({ chainSpec: ksmcc3 })

    yield* Console.log("test").pipe(Effect.delay("1 second"), Effect.forever)
  }).pipe(Effect.tapError(Effect.logError), Effect.scoped, Effect.forkScoped)

  yield* Effect.sleep("3 seconds")

  yield* Effect.logInfo("interrupting fiber")
  yield* Fiber.interrupt(fiber)
  yield* Effect.logInfo("interrupted")

  yield* Effect.interrupt

  yield* Effect.void.pipe(Effect.forever)
}).pipe(
  Effect.tapErrorCause((cause) => Effect.logError(Cause.pretty(cause))),
  Effect.tapDefect((cause) => Effect.logFatal(Cause.pretty(cause))),
  Effect.provide(logger),
  Effect.scoped,
)

NodeRuntime.runMain(main, { disableErrorReporting: true })

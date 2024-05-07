import * as smoldot from "smoldot"
import * as bindings from "../bindings"
import { Effect, pipe as $, Runtime } from "effect"

export type AcquireOptions = Omit<smoldot.ClientOptions, "logCallback"> & {
  logCallback: (
    ...args: Parameters<NonNullable<smoldot.ClientOptions["logCallback"]>>
  ) => Effect.Effect<void, never, never>
}

export const acquire = (
  options: AcquireOptions,
): Effect.Effect<bindings.client.Client, never, never> =>
  $(
    Effect.runtime<never>(),
    Effect.andThen(Runtime.runSync),
    Effect.andThen((runSync) =>
      Effect.sync(() =>
        smoldot.start({
          ...options,
          logCallback: (...args) => options.logCallback(...args).pipe(runSync),
        }),
      ),
    ),
    Effect.map(bindings.client.make),
  )

export const release = (
  client: bindings.client.Client,
): Effect.Effect<void, never, never> =>
  client.terminate.pipe(Effect.catchAll(Effect.logError))

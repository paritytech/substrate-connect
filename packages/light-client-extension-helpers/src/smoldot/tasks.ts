import { Client, AddChainError } from "."
import { Effect, Fiber, Runtime, Schedule } from "effect"

export const DEFAULT_SUPERVISE_REPEAT_SCHEDULE = Schedule.spaced("1 second")
export const DEFAULT_SUPERVISE_RETRY_SCHEDULE = Schedule.spaced("1 second")

export type SuperviseOptions = {
  repeatSchedule: Schedule.Schedule<number>
  retrySchedule: Schedule.Schedule<number>
}

/**
 * Supervises a smoldot client by periodically invoking `addChain` with an
 * empty chain spec.
 *
 * If `addChain` fails with anything other than a `AddChainError`, the client
 * will be restarted.
 *
 * @param client - The smoldot client instance to be supervised.
 * @param options - Options for customizing the supervision behavior.
 * @param options.repeatSchedule - The frequency at which to invoke `addChain`.
 * Defaults to {@link DEFAULT_SUPERVISE_REPEAT_SCHEDULE}.
 * @param options.retrySchedule - The frequency at which to attempt restarting
 * the client if needed. Defaults to {@link DEFAULT_SUPERVISE_RETRY_SCHEDULE}.
 */
export const supervise = (
  client: Client,
  { repeatSchedule, retrySchedule }: SuperviseOptions = {
    repeatSchedule: DEFAULT_SUPERVISE_REPEAT_SCHEDULE,
    retrySchedule: DEFAULT_SUPERVISE_RETRY_SCHEDULE,
  },
) =>
  Effect.gen(function* () {
    const runtime = yield* Effect.runtime<never>()
    const runPromise = Runtime.runPromise(runtime)

    const daemon = yield* Effect.tryPromise(() =>
      client
        .addChain({ chainSpec: "" })
        .then(() => {})
        .catch((err) => {
          if (err instanceof AddChainError) {
            return
          }

          throw err
        }),
    ).pipe(
      Effect.repeat({
        schedule: repeatSchedule,
      }),
      Effect.tapError(() => Effect.tryPromise(() => client.restart())),
      Effect.tapError(Effect.logError),
      Effect.retry({
        schedule: retrySchedule,
      }),
      Effect.forkDaemon,
    )

    const stop = () =>
      Fiber.interrupt(daemon)
        .pipe(Effect.andThen(() => Effect.void))
        .pipe(runPromise)

    return {
      stop,
    }
  }).pipe(Effect.runSync)

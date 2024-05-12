import { Client, AddChainError } from "."
import { Console, Effect, Fiber, Runtime, Schedule, pipe as $ } from "effect"

export const DEFAULT_SUPERVISE_REPEAT_SCHEDULE = $(
  Schedule.spaced("1 second"),
  Schedule.jitteredWith({ min: 0.8, max: 1.5 }),
)

export const DEFAULT_SUPERVISE_RETRY_SCHEDULE = $(
  Schedule.spaced("1 second"),
  Schedule.jitteredWith({ min: 0.8, max: 1.5 }),
)

export type SuperviseOptions = {
  repeatSchedule: Schedule.Schedule<number>
  retrySchedule: Schedule.Schedule<number>
}

export const supervise = async (
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
      Effect.tapError(Console.error),
      Effect.repeat({
        schedule: repeatSchedule,
      }),
      Effect.tapError(() => Effect.tryPromise(() => client.restart())),
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
  }).pipe(Effect.runPromise)

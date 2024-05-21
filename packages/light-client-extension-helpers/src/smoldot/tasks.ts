import { Client, AddChainError } from "./types"

export type SuperviseOptions = {
  repeatScheduleMs?: number
  retryScheduleMs?: number
  abortSignal?: AbortSignal
  onError?: (error: Error) => void
}

export const DEFAULT_SUPERVISE_REPEAT_SCHEDULE = 1000
export const DEFAULT_SUPERVISE_RETRY_SCHEDULE = 1000

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
 * @param options.abortSignal - An `AbortSignal` that can be used to
 * stop the supervision.
 * @param options.onError - error handler for whenever smoldot crashes
 */
export const supervise = (
  client: Client,
  options: SuperviseOptions = {},
): void => {
  const repeatScheduleMs =
    options.repeatScheduleMs ?? DEFAULT_SUPERVISE_REPEAT_SCHEDULE
  const retryScheduleMs =
    options.retryScheduleMs ?? DEFAULT_SUPERVISE_RETRY_SCHEDULE

  if (options?.abortSignal?.aborted) {
    return
  }

  let stopped = false

  async function checkIfSmoldotIsHealthy(): Promise<void> {
    return client
      .addChain({ chainSpec: "" })
      .then(() => void 0)
      .catch((err) => {
        if (err instanceof AddChainError) {
          return
        }
        throw err
      })
  }

  ;(async () => {
    while (!stopped) {
      try {
        await checkIfSmoldotIsHealthy()
        await sleep(repeatScheduleMs)
      } catch (err) {
        try {
          options.onError?.(err as Error)
          await client.restart()
          await sleep(retryScheduleMs)
        } catch {}
      }
    }
  })()

  if (options.abortSignal) {
    options.abortSignal.addEventListener("abort", () => {
      stopped = true
    })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

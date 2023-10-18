let guard = Promise.resolve()

/**
 * Schedule fn to be executed after previous enqueued fns have been executed.
 *
 * @example
 * // logs
 * //   1
 * //   Unhandled error on 'enqueueAsyncFn' Error
 * //   2
 * //   3
 * enqueueAsyncFn(() => console.log(1))
 * enqueueAsyncFn(() => {
 *   throw new Error()
 * })
 * enqueueAsyncFn(
 *   () =>
 *     new Promise((resolve) =>
 *       setTimeout(() => {
 *         console.log(2)
 *         resolve()
 *       }, 10),
 *     ),
 * )
 * enqueueAsyncFn(() => console.log(3))
 */
export const enqueueAsyncFn = (fn: () => Promise<void>): Promise<void> =>
  (guard = guard
    .then(fn)
    .catch((error) =>
      console.error("Unhandled error on 'enqueueAsyncFn'", error),
    ))

let guard = Promise.resolve()
export const enqueueAsyncFn = (fn: () => Promise<void>) => {
  Promise.resolve(guard.then(fn))
  guard = new Promise((resolve) => guard.then(fn).finally(resolve))
}

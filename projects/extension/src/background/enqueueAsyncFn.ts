let guard = Promise.resolve()
export const enqueueAsyncFn = (fn: () => Promise<void>) => {
  return (guard = new Promise((resolve) => guard.then(fn).finally(resolve)))
}

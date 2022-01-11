import { DependencyList, EffectCallback, useEffect, useRef } from "react"

/**
 * Exactly like React's `useEffect`, but skips initial render. Tries to
 * reproduce `componentDidUpdate` behavior.
 *
 * @see https://stackoverflow.com/questions/53179075/with-useeffect-how-can-i-skip-applying-an-effect-upon-the-initial-render/53180013#53180013
 */
export function useDidUpdateEffect(
  fn: EffectCallback,
  inputs?: DependencyList,
): void {
  const didMountRef = useRef(false)

  return useEffect(() => {
    if (didMountRef.current) fn()
    else didMountRef.current = true
  }, [inputs, fn])
}

import { useEffect, useRef, MutableRefObject } from "react"

export type MountedRef = MutableRefObject<boolean>

export const useIsMountedRef = (): MountedRef => {
  const isMounted = useRef(false)

  useEffect((): (() => void) => {
    isMounted.current = true

    return (): void => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}

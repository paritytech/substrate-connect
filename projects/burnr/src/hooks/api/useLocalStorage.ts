import { useEffect, useState, Dispatch, SetStateAction } from "react"

export const useLocalStorage = (
  localStorageKey: string,
): [string, Dispatch<SetStateAction<string>>] => {
  const [localValue, setLocalValue] = useState<string>(
    localStorage.getItem(localStorageKey) || "",
  )

  useEffect((): void => {
    localStorage.setItem(localStorageKey, localValue)
  }, [localValue, localStorageKey])

  return [localValue, setLocalValue]
}

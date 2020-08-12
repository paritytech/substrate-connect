import { useEffect, useState} from 'react';
 
export default function useLocalStorage(localStorageKey: string) {
  const [localValue, setLocalValue] = useState(
    localStorage.getItem(localStorageKey) || ''
  );
 
  useEffect((): void => {
    localStorage.setItem(localStorageKey, localValue);
  }, [localValue]);
 
  return [localValue, setLocalValue] as const;
};
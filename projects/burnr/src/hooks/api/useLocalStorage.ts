import { useEffect, useState} from 'react';
 
const useLocalStorage = (localStorageKey: string): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [localValue, setLocalValue] = useState(
    localStorage.getItem(localStorageKey) || ''
  );
 
  useEffect((): void => {
    localStorage.setItem(localStorageKey, localValue);
  }, [localValue, localStorageKey]);
 
  return [localValue, setLocalValue];
}

export default useLocalStorage;

import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T, skipHydration = false): [T, (value: T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Read from localStorage on initial mount
  useEffect(() => {
    if (skipHydration) return // Skip if hydration is not needed
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      const value = item ? JSON.parse(item) : initialValue
      setStoredValue(value)
    } catch (error) {
      // If error also return initialValue
      console.error(error)
      setStoredValue(initialValue)
    }
  }, [key, initialValue, skipHydration])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        // Save state
        setStoredValue(valueToStore)
        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.error(error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}


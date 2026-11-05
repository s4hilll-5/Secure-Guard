import { useEffect, useState } from 'react';

/**
 * useState that is automatically persisted to LocalStorage.
 *
 * - Reads the stored value once on mount (lazy initialiser).
 * - Falls back to `initialValue` (value or factory function) if nothing is
 *   stored or the stored JSON is corrupted.
 * - Writes back whenever the value changes.
 * - All storage access is wrapped in try/catch because LocalStorage can be
 *   unavailable (private mode, storage quota, sandboxed iframes).
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch {
      // ignore and fall back to the initial value
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable - the app keeps working with in-memory state
    }
  }, [key, value]);

  return [value, setValue];
}

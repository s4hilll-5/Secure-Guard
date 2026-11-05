import { useEffect } from 'react';

/**
 * Calls `onOutside` when the user clicks/taps outside `ref` or presses Escape.
 * Used by dropdowns (notifications, profile menu, search results).
 */
export default function useClickOutside(ref, onOutside, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onOutside();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onOutside, enabled]);
}

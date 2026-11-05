import { useEffect, useState } from 'react';

/**
 * Returns `true` for `delay` ms after mount, then `false`.
 * Lets pages show skeleton loaders as if data were being fetched from an API,
 * which keeps the loading-state UI visible in this frontend-only demo.
 */
export default function useSimulatedLoading(delay = 650) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return loading;
}

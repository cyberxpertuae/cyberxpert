import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

/** Load data from a service with loading / error / refresh states. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const alive = useRef(true);
  const run = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const r = await fn();
      if (alive.current) setData(r);
    } catch (e) {
      if (alive.current) setError(e as Error);
    } finally {
      if (alive.current) { setLoading(false); setRefreshing(false); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    alive.current = true;
    run();
    return () => { alive.current = false; };
  }, [run]);
  return { data, loading, error, refreshing, reload: () => run(false), refresh: () => run(true), setData };
}

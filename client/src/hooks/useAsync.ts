import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

/**
 * Runs an async loader outside the synchronous effect body and ignores results
 * from stale runs. Keeping the loader invocation asynchronous avoids
 * setState-during-render cascades while still supporting re-fetching.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: true });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const data = await loader();
        if (active) setState({ data, error: null, loading: false });
      } catch (error) {
        if (active) {
          setState({ data: null, error: error as Error, loading: false });
        }
      }
    };
    void run();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}

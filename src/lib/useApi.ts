import React from 'react';
import { apiGet } from './api';

// Hook simple de lectura: { data, loading, error, reload }.
export function useApi<T>(path: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    apiGet<T>(path)
      .then((d) => { if (alive) { setData(d); setError(null); } })
      .catch((e: Error) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [path, nonce]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}

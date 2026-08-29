import { useState } from 'react';

export function useAdminRequestState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const beginRequest = () => {
    setLoading(true);
    setError(null);
  };

  const reload = () => {
    beginRequest();
    setReloadKey((key) => key + 1);
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    reloadKey,
    beginRequest,
    reload,
  };
}

import { useCallback, useEffect, useState } from 'react';
import { personApi } from '../services/person-api';

export function usePersons() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPersons = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await personApi.getAll({ signal, size: 100, sort: 'name,asc' });
      setPersons(Array.isArray(data?.content) ? data.content : []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to load persons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPersons(controller.signal);
    return () => controller.abort();
  }, [loadPersons]);

  const reload = useCallback(() => {
    const controller = new AbortController();
    return loadPersons(controller.signal);
  }, [loadPersons]);

  return { persons, loading, error, reload };
}

'use client';

import { useState, useEffect } from 'react';
import { loggerApi } from '@/services/loggerApi';
import { MetricsOverview, CategoryMetrics } from '@/types/logs';

export function useMetrics() {
  const [data, setData] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const result = await loggerApi.getMetricsOverview();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

export function useCategoryMetrics() {
  const [data, setData] = useState<CategoryMetrics[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        const result = await loggerApi.getCategoryMetrics();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch category metrics'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

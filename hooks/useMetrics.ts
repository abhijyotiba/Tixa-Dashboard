'use client';

import { useState, useEffect } from 'react';
import { loggerApi } from '@/services/loggerApi';
import { MetricsOverview, CategoryMetrics } from '@/types/logs';
import { getCached, setCache, createCacheKey } from '@/lib/cache';

// Cache TTL: 60 seconds for metrics (they change less frequently)
const METRICS_CACHE_TTL = 60 * 1000;

export function useMetrics(period: number = 7) {
  const [data, setData] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = createCacheKey('metrics', { period });

    async function fetchMetrics() {
      try {
        // Check cache first
        const cached = getCached<MetricsOverview>(cacheKey, METRICS_CACHE_TTL);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const result = await loggerApi.getMetricsOverview(period);
        
        // If time_series is empty, try to fetch it separately
        if (isMounted && (!result.time_series || result.time_series.length === 0)) {
          const timeSeries = await loggerApi.getTimeSeries(period);
          result.time_series = timeSeries;
        }
        
        if (isMounted) {
          setCache(cacheKey, result);
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
  }, [period]);

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

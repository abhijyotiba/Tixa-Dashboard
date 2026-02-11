'use client';

import { useState, useEffect } from 'react';
import { loggerApi } from '@/services/loggerApi';
import { WorkflowLog, LogsListResponse, LogQueryParams } from '@/types/logs';
import { getCached, setCache, createCacheKey } from '@/lib/cache';

// Cache TTL: 30 seconds for logs list
const LOGS_CACHE_TTL = 30 * 1000;

export function useLogs(params: LogQueryParams = {}) {
  const [data, setData] = useState<LogsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = createCacheKey('logs', params);

    async function fetchLogs() {
      try {
        // Check cache first
        const cached = getCached<LogsListResponse>(cacheKey, LOGS_CACHE_TTL);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const result = await loggerApi.getLogs(params);
        if (isMounted) {
          setCache(cacheKey, result);
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}

// FIX: Changed parameter type from `string | null` to `string | null` 
// and added proper null check before calling API
export function useLogDetail(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;

    async function fetchLog() {
      try {
        setLoading(true);
        setError(null);
        const result = await loggerApi.getLogById(id as string);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch log'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLog();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { data, loading, error };
}
'use client';

import { useState, useEffect } from 'react';
import { loggerApi } from '@/services/loggerApi';
import { WorkflowLog, LogsListResponse, LogQueryParams } from '@/types/logs';

export function useLogs(params: LogQueryParams = {}) {
  const [data, setData] = useState<LogsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        const result = await loggerApi.getLogs(params);
        if (isMounted) {
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

export function useLogDetail(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchLog() {
      try {
        setLoading(true);
        setError(null);
        const result = await loggerApi.getLogById(id);
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

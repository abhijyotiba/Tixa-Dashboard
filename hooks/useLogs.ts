'use client';

import useSWR from 'swr';
import { loggerApi } from '@/services/loggerApi';
import { LogsListResponse, LogQueryParams } from '@/types/logs';

export function useLogs(params: LogQueryParams = {}) {
  // Create stable cache key from params
  const cacheKey = JSON.stringify(['logs', params]);

  const { data, error, isLoading, mutate } = useSWR<LogsListResponse>(
    cacheKey,
    () => loggerApi.getLogs(params),
    {
      // Logs change more frequently, refresh every 30s
      refreshInterval: 30000,
      dedupingInterval: 30000,
      keepPreviousData: true,
    }
  );

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}

export function useLogDetail(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    // Only fetch if id exists
    id ? ['logDetail', id] : null,
    () => loggerApi.getLogById(id!),
    {
      // Log details don't change often
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}
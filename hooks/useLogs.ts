'use client';

import useSWR from 'swr';
import { loggerApi } from '@/services/loggerApi';
import { LogsListResponse, LogQueryParams, LogDetail } from '@/types/logs';
import { isDemoLogId, getDemoLogDetail } from '@/lib/demoData';

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
  // Check if this is a demo log - if so, return demo data directly
  const isDemo = id ? isDemoLogId(id) : false;
  
  const { data, error, isLoading, mutate } = useSWR<LogDetail | null>(
    // Only fetch from API if id exists AND it's not a demo log
    id && !isDemo ? ['logDetail', id] : null,
    () => loggerApi.getLogById(id!),
    {
      // Log details don't change often
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // If it's a demo log, return the demo data
  if (isDemo && id) {
    const demoData = getDemoLogDetail(id);
    return {
      data: demoData,
      loading: false,
      error: demoData ? null : new Error('Demo log not found'),
      refresh: () => Promise.resolve(demoData),
    };
  }

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ?? null,
    refresh: mutate,
  };
}
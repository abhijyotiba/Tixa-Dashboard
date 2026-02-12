'use client';

import useSWR from 'swr';
import { loggerApi } from '@/services/loggerApi';
import { MetricsOverview, CategoryMetrics } from '@/types/logs';

/**
 * Fetch metrics with time series data
 * SWR handles caching, revalidation, and deduplication automatically
 */
async function fetchMetricsWithTimeSeries(period: number): Promise<MetricsOverview> {
  const result = await loggerApi.getMetricsOverview(period);
  
  // If time_series is empty, try to fetch it separately
  if (!result.time_series || result.time_series.length === 0) {
    const timeSeries = await loggerApi.getTimeSeries(period);
    result.time_series = timeSeries;
  }
  
  return result;
}

export function useMetrics(period: number = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    ['metrics', period],
    () => fetchMetricsWithTimeSeries(period),
    {
      // Keep data fresh with 60s revalidation
      refreshInterval: 60000,
      // Dedupe requests within 60s
      dedupingInterval: 60000,
      // Keep showing old data while fetching new
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

export function useCategoryMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    'categoryMetrics',
    () => loggerApi.getCategoryMetrics(),
    {
      refreshInterval: 60000,
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

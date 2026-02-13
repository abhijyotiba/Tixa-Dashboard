/**
 * Custom hook for fetching support tickets using SWR
 */
import useSWR from 'swr';
import { supportApi } from '@/services/supportApi';
import { TicketsQueryParams, TicketsListResponse } from '@/types/support';

/**
 * Hook to fetch user's support tickets
 */
export function useTickets(params?: TicketsQueryParams) {
  const cacheKey = ['support-tickets', params?.page, params?.page_size, params?.status];
  
  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => supportApi.listTickets(params),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    tickets: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    isLoading,
    error,
    mutate, // For manual refresh after creating/updating tickets
  };
}

/**
 * Hook to fetch a single ticket by ID
 */
export function useTicket(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? ['support-ticket', id] : null,
    () => supportApi.getTicket(id!),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    ticket: data,
    isLoading,
    error,
    mutate,
  };
}

'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

// Global SWR configuration for optimal performance
export const swrConfig = {
  // Revalidate on focus (when user tabs back)
  revalidateOnFocus: true,
  // Revalidate when reconnecting to internet
  revalidateOnReconnect: true,
  // Don't retry on error (optional)
  errorRetryCount: 2,
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  // Keep previous data while revalidating
  keepPreviousData: true,
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}

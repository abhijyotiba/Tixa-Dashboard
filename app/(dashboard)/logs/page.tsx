'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import LogsTable from '@/components/logs/LogsTable';
import { useLogs } from '@/hooks/useLogs';
import { DEMO_LOGS, DEMO_BANNER_KEY } from '@/lib/demoData';
import { ChevronLeft, ChevronRight, X, Sparkles, Search } from 'lucide-react';

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    status: '',
    environment: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const [hasAnyRealData, setHasAnyRealData] = useState<boolean | null>(null);

  const { data, loading, error } = useLogs({ 
    page, 
    page_size: pageSize,
    ...(filters.status && { status: filters.status }),
    ...(filters.environment && { environment: filters.environment }),
    ...(searchQuery.trim() && { ticket_id: searchQuery.trim() }),
  });

  const { data: unfilteredData } = useLogs({ page: 1, page_size: 1 });

  useEffect(() => {
    if (unfilteredData !== null) {
      setHasAnyRealData((unfilteredData?.total ?? 0) > 0);
    }
  }, [unfilteredData]);

  const isDemo = hasAnyRealData === false;

  const getFilteredDemoLogs = () => {
    let filtered = DEMO_LOGS;
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    if (filters.environment) {
      filtered = filtered.filter(log => log.environment === filters.environment);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(log => 
        log.ticket_id.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  useEffect(() => {
    if (isDemo) {
      const dismissed = localStorage.getItem(DEMO_BANNER_KEY);
      setShowDemoBanner(!dismissed);
    } else {
      setShowDemoBanner(false);
    }
  }, [isDemo]);

  const dismissBanner = () => {
    localStorage.setItem(DEMO_BANNER_KEY, 'true');
    setShowDemoBanner(false);
  };

  const filteredDemoLogs = getFilteredDemoLogs();
  const displayLogs = isDemo ? filteredDemoLogs : (data?.items ?? []);
  const displayTotal = isDemo ? filteredDemoLogs.length : (data?.total ?? 0);
  const displayPages = isDemo ? 1 : (data?.pages ?? 1);
  const isLoading = loading || hasAnyRealData === null;

  return (
    <>
      <Header 
        title="Workflow Logs" 
        description="View and search execution logs"
      />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {/* Demo Banner */}
        {showDemoBanner && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  You're viewing sample logs
                </p>
                <p className="text-xs text-blue-700">
                  Connect your workflow to see real execution logs
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Ticket ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Enter ticket ID..."
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">All</option>
                <option value="SUCCESS">Success</option>
                <option value="ERROR">Error</option>
                <option value="FAILED">Failed</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <select
                value={filters.environment}
                onChange={(e) => {
                  setFilters({ ...filters, environment: e.target.value });
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">All</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="p-8 text-center text-gray-500">
              Loading logs...
            </div>
          )}

          {error && !isDemo && (
            <div className="p-8 text-center text-red-600">
              Error loading logs: {error.message}
            </div>
          )}

          {!isLoading && (
            <>
              {displayLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No logs found
                </div>
              ) : (
                <LogsTable logs={displayLogs} />
              )}

              {/* Pagination */}
              {displayTotal > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * pageSize, displayTotal)}
                    </span>{' '}
                    of <span className="font-medium">{displayTotal}</span> results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {page} of {displayPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(displayPages, page + 1))}
                      disabled={page === displayPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

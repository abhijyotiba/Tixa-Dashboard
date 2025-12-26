'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LogsTable from '@/components/logs/LogsTable';
import { useLogs } from '@/hooks/useLogs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    status: '',
    environment: '',
  });

  const { data, loading, error } = useLogs({ 
    page, 
    page_size: pageSize,
    ...(filters.status && { status: filters.status }),
    ...(filters.environment && { environment: filters.environment }),
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Workflow Logs" 
          description="View and search execution logs"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            {loading && (
              <div className="p-8 text-center text-gray-500">
                Loading logs...
              </div>
            )}

            {error && (
              <div className="p-8 text-center text-red-600">
                Error loading logs: {error.message}
              </div>
            )}

            {data && !loading && !error && (
              <>
                {data.items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No logs found
                  </div>
                ) : (
                  <LogsTable logs={data.items} />
                )}

                {/* Pagination */}
                {data.total > 0 && (
                  <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(page * pageSize, data.total)}
                      </span>{' '}
                      of <span className="font-medium">{data.total}</span> results
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
                        Page {page} of {data.pages}
                      </span>
                      <button
                        onClick={() => setPage(Math.min(data.pages, page + 1))}
                        disabled={page === data.pages}
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
      </div>
    </div>
  );
}

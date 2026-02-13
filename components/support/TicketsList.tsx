'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { TicketCard } from './TicketCard';
import { TicketStatus } from '@/types/support';
import { Inbox, Loader2 } from 'lucide-react';

export default function TicketsList() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { tickets, total, isLoading, error, mutate } = useTickets({
    page,
    page_size: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handleStatusFilter = (status: TicketStatus | 'all') => {
    setStatusFilter(status);
    setPage(1); // Reset to first page when filtering
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-3 py-2 rounded-md text-sm">
        Failed to load tickets. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => handleStatusFilter('all')}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleStatusFilter('open')}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
            statusFilter === 'open'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Open
        </button>
        <button
          onClick={() => handleStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
            statusFilter === 'in_progress'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => handleStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
            statusFilter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Resolved
        </button>
        <button
          onClick={() => handleStatusFilter('closed')}
          className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
            statusFilter === 'closed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Closed
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tickets.length === 0 && (
        <div className="text-center py-8">
          <Inbox className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No tickets found</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {statusFilter === 'all'
              ? "You haven't created any tickets yet."
              : `No ${statusFilter.replace('_', ' ')} tickets.`}
          </p>
        </div>
      )}

      {/* Tickets List */}
      {!isLoading && tickets.length > 0 && (
        <>
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onUpdate={mutate} />
            ))}
          </div>

          {/* Pagination Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
            Showing {tickets.length} of {total}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { WorkflowLog } from '@/types/logs';
import { 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface LogsTableProps {
  logs: WorkflowLog[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return { 
          classes: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800',
          icon: <CheckCircle2 className="h-3 w-3" />
        };
      case 'ERROR':
      case 'FAILED':
        return { 
          classes: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',
          icon: <XCircle className="h-3 w-3" />
        };
      case 'PARTIAL':
        return { 
          classes: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      default:
        return { 
          classes: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600',
          icon: <Activity className="h-3 w-3" />
        };
    }
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
        <Activity className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm font-medium">No logs found</p>
        <p className="text-xs mt-1">Try adjusting your filters or date range</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Ticket ID
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Environment
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Executed
            </th>
            <th className="px-6 py-3 text-right text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {logs.map((log) => {
            const statusConfig = getStatusConfig(log.status);
            return (
              <tr 
                key={log.id} 
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/logs/${log.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors">
                    {log.ticket_id || <span className="text-gray-400 text-xs">—</span>}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${statusConfig.classes}`}>
                    {statusConfig.icon}
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {log.category || <span className="text-gray-400 text-xs">—</span>}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                    {log.environment}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="font-mono tabular-nums">{log.execution_time_seconds?.toFixed(2)}s</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(log.executed_at), 'MMM dd, HH:mm:ss')}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/logs/${log.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-primary dark:hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                  >
                    View
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

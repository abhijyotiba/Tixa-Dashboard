'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Clock, 
  Server,
  GitBranch,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import Header from '@/components/layout/Header';
import TraceTimeline from '@/components/logs/TraceTimeline';
import JsonViewer from '@/components/logs/JsonViewer';
import { CommentsSection } from '@/components/comments';
import { useLogDetail } from '@/hooks/useLogs';

export default function LogDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: log, loading, error } = useLogDetail(id);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['timeline', 'react', 'output'])
  );

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections);
    if (next.has(section)) {
      next.delete(section);
    } else {
      next.add(section);
    }
    setExpandedSections(next);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      SUCCESS: 'bg-green-100 text-green-800',
      ERROR: 'bg-red-100 text-red-800',
      FAILED: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <>
        <Header title="Log Detail" description="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading log details...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Log Detail" description="Error" />
        <div className="flex-1 flex items-center justify-center flex-col bg-gray-50">
          <div className="text-red-600 mb-4">Error: {error.message}</div>
          <Link href="/logs" className="text-primary hover:underline">
            Back to Logs
          </Link>
        </div>
      </>
    );
  }

  if (!log) {
    return (
      <>
        <Header title="Log Detail" description="Not Found" />
        <div className="flex-1 flex items-center justify-center flex-col bg-gray-50">
          <div className="text-gray-500 mb-4">Log not found</div>
          <Link href="/logs" className="text-primary hover:underline">
            Back to Logs
          </Link>
        </div>
      </>
    );
  }

  const confidenceScore = log.metrics?.overall_confidence 
    ? log.metrics.overall_confidence.toFixed(1) 
    : '0.0';

  return (
    <>
      <Header 
        title="Log Detail" 
        description={`Transaction ID: ${log.ticket_id || log.id}`}
      />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {/* Back Button */}
        <Link 
          href="/logs"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Logs
        </Link>

        {/* Header / Context */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {log.category || 'Uncategorized Workflow'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Log ID: {log.id}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Server className="h-4 w-4 mr-1" />
                  Client: <span className="font-medium ml-1">{log.client_id}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <GitBranch className="h-4 w-4 mr-1" />
                  Env: <span className="font-medium ml-1">{log.environment}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  Ver: <span className="font-medium ml-1">{log.workflow_version}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {log.executed_at ? format(new Date(log.executed_at), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(log.status)}`}>
                {log.status}
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-600">Execution Time</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {typeof log.execution_time_seconds === 'number' ? log.execution_time_seconds.toFixed(2) : '0.00'}s
            </p>
          </div>
          
          {log.metrics?.react_iterations !== undefined && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">ReACT Iterations</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {log.metrics.react_iterations}
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-600">Overall Confidence</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {confidenceScore}%
            </p>
          </div>

          {log.metrics?.hallucination_risk !== undefined && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">Hallucination Risk</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {(log.metrics.hallucination_risk * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <CommentsSection logId={log.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Timeline & Trace */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-4"
              >
                <span>Execution Timeline</span>
                {expandedSections.has('timeline') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              {expandedSections.has('timeline') && (
                <TraceTimeline trace={log.trace} /> 
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Payload */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
              <JsonViewer data={log.metrics || {}} />
            </div>

            {log.trace?.retrieval && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <button
                  onClick={() => toggleSection('retrieval')}
                  className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-4"
                >
                  <span>Retrieval Data</span>
                  {expandedSections.has('retrieval') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                
                {expandedSections.has('retrieval') && (
                  <div className="text-sm">
                    <JsonViewer data={log.trace.retrieval} defaultExpanded={true} />
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Payload</h3>
              <JsonViewer data={log.trace || {}} defaultExpanded={false} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

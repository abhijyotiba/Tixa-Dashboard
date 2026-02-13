'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, 
  Clock, 
  Server,
  GitBranch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  Gauge,
  BrainCircuit,
  ShieldAlert,
  Activity,
  FileJson,
  MessageCircle,
  Database,
  Copy,
  Check,
  Hash,
  CalendarDays,
  Layers,
  ChevronRight,
} from 'lucide-react';

import Header from '@/components/layout/Header';
import TraceTimeline from '@/components/logs/TraceTimeline';
import JsonViewer from '@/components/logs/JsonViewer';
import { CommentsSection } from '@/components/comments';
import { useLogDetail } from '@/hooks/useLogs';

type TabKey = 'timeline' | 'metrics' | 'retrieval' | 'payload' | 'comments';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'timeline', label: 'Timeline', icon: <Activity className="h-4 w-4" /> },
  { key: 'metrics', label: 'Metrics', icon: <Gauge className="h-4 w-4" /> },
  { key: 'retrieval', label: 'Retrieval', icon: <Database className="h-4 w-4" /> },
  { key: 'payload', label: 'Raw Payload', icon: <FileJson className="h-4 w-4" /> },
  { key: 'comments', label: 'Comments', icon: <MessageCircle className="h-4 w-4" /> },
];

// Skeleton loader for professional feel
function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-48 bg-gray-100 dark:bg-gray-700/50 rounded" />
            <div className="flex gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-4 w-24 bg-gray-100 dark:bg-gray-700/50 rounded" />)}
            </div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-64" />
    </div>
  );
}

export default function LogDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: log, loading, error } = useLogDetail(id);
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [copiedId, setCopiedId] = useState(false);

  const copyId = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch { /* ignore */ }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode; label: string }> = {
      SUCCESS: { 
        bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
        text: 'text-emerald-700 dark:text-emerald-300', 
        ring: 'ring-emerald-200 dark:ring-emerald-800',
        icon: <CheckCircle2 className="h-4 w-4" />, 
        label: 'Success' 
      },
      ERROR: { 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        text: 'text-red-700 dark:text-red-300', 
        ring: 'ring-red-200 dark:ring-red-800',
        icon: <XCircle className="h-4 w-4" />, 
        label: 'Error' 
      },
      FAILED: { 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        text: 'text-red-700 dark:text-red-300', 
        ring: 'ring-red-200 dark:ring-red-800',
        icon: <XCircle className="h-4 w-4" />, 
        label: 'Failed' 
      },
      PARTIAL: { 
        bg: 'bg-amber-50 dark:bg-amber-900/20', 
        text: 'text-amber-700 dark:text-amber-300', 
        ring: 'ring-amber-200 dark:ring-amber-800',
        icon: <AlertTriangle className="h-4 w-4" />, 
        label: 'Partial' 
      },
    };
    return configs[status] || { 
      bg: 'bg-gray-50 dark:bg-gray-800', 
      text: 'text-gray-700 dark:text-gray-300', 
      ring: 'ring-gray-200 dark:ring-gray-700',
      icon: <Activity className="h-4 w-4" />, 
      label: status 
    };
  };

  if (loading) {
    return (
      <>
        <Header title="Log Detail" description="Loading..." />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <DetailSkeleton />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Log Detail" description="Error" />
        <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load log</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error.message}</p>
            </div>
            <Link href="/logs" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Logs
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!log) {
    return (
      <>
        <Header title="Log Detail" description="Not Found" />
        <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FileJson className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log not found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This log may have been deleted or doesn&apos;t exist.</p>
            </div>
            <Link href="/logs" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Logs
            </Link>
          </div>
        </main>
      </>
    );
  }

  const statusConfig = getStatusConfig(log.status);
  const confidenceScore = log.metrics?.overall_confidence 
    ? log.metrics.overall_confidence
    : 0;
  const hallucinationRisk = log.metrics?.hallucination_risk;
  const hasRetrieval = !!log.trace?.retrieval;

  // Filter out retrieval tab if no data
  const visibleTabs = tabs.filter(t => {
    if (t.key === 'retrieval' && !hasRetrieval) return false;
    return true;
  });

  return (
    <>
      <Header 
        title="Log Detail" 
        description={`Transaction ${log.ticket_id || log.id.slice(0, 8)}`}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/logs" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Logs
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {log.ticket_id || log.id.slice(0, 12)}
            </span>
          </nav>

          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Status stripe at top */}
            <div className={`h-1 ${
              log.status === 'SUCCESS' ? 'bg-emerald-500' : 
              log.status === 'ERROR' || log.status === 'FAILED' ? 'bg-red-500' : 
              log.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-gray-400'
            }`} />
            
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4 min-w-0 flex-1">
                  {/* Title & Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {log.category || 'Uncategorized Workflow'}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* ID Row */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      ID: {log.id}
                    </span>
                    <button 
                      onClick={() => copyId(log.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Copy ID"
                    >
                      {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  
                  {/* Metadata Pills */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                      <Server className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">{log.client_id}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                      <GitBranch className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">{log.environment}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                      <Layers className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">v{log.workflow_version}</span>
                    </div>
                    {log.ticket_id && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                        <Hash className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium">{log.ticket_id}</span>
                      </div>
                    )}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                      <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">
                        {log.executed_at ? format(new Date(log.executed_at), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                      </span>
                      {log.executed_at && (
                        <span className="text-gray-400 dark:text-gray-500">
                          ({formatDistanceToNow(new Date(log.executed_at), { addSuffix: true })})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Execution Time */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Timer className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Execution Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {typeof log.execution_time_seconds === 'number' ? log.execution_time_seconds.toFixed(2) : '0.00'}
                <span className="text-sm font-normal text-gray-400 ml-0.5">s</span>
              </p>
            </div>
            
            {/* ReACT Iterations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">ReACT Iterations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {log.metrics?.react_iterations ?? '—'}
              </p>
            </div>

            {/* Overall Confidence */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Gauge className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Confidence</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {confidenceScore > 0 ? confidenceScore.toFixed(1) : '—'}
                  {confidenceScore > 0 && <span className="text-sm font-normal text-gray-400 ml-0.5">%</span>}
                </p>
              </div>
              {confidenceScore > 0 && (
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      confidenceScore >= 80 ? 'bg-emerald-500' : 
                      confidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(confidenceScore, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Hallucination Risk */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Hallucination Risk</span>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {hallucinationRisk !== undefined ? (hallucinationRisk * 100).toFixed(1) : '—'}
                  {hallucinationRisk !== undefined && <span className="text-sm font-normal text-gray-400 ml-0.5">%</span>}
                </p>
              </div>
              {hallucinationRisk !== undefined && (
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      hallucinationRisk <= 0.2 ? 'bg-emerald-500' : 
                      hallucinationRisk <= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(hallucinationRisk * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Tab Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <nav className="flex gap-0 overflow-x-auto px-2" aria-label="Tabs">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div>
                  <TraceTimeline trace={log.trace} />
                </div>
              )}

              {/* Metrics Tab */}
              {activeTab === 'metrics' && (
                <div className="space-y-6">
                  {/* Metrics Grid */}
                  {log.metrics && Object.keys(log.metrics).length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(log.metrics).map(([key, value]) => {
                          if (typeof value !== 'number' && typeof value !== 'string') return null;
                          return (
                            <div key={key} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                                {typeof value === 'number' 
                                  ? (value < 1 && value > 0 ? (value * 100).toFixed(1) + '%' : 
                                     Number.isInteger(value) ? value : value.toFixed(2))
                                  : value}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Full Metrics Data</h4>
                        <JsonViewer data={log.metrics} defaultExpanded={true} title="Metrics JSON" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Gauge className="h-10 w-10 mb-3 opacity-40" />
                      <p className="text-sm font-medium">No metrics data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Retrieval Tab */}
              {activeTab === 'retrieval' && (
                <div>
                  {log.trace?.retrieval ? (
                    <JsonViewer data={log.trace.retrieval} defaultExpanded={true} title="Retrieval Data" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <Database className="h-10 w-10 mb-3 opacity-40" />
                      <p className="text-sm font-medium">No retrieval data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Payload Tab */}
              {activeTab === 'payload' && (
                <div>
                  <JsonViewer 
                    data={log.trace || {}} 
                    defaultExpanded={true} 
                    title="Full Trace Payload" 
                    maxHeight="max-h-[600px]"
                  />
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  <CommentsSection logId={log.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

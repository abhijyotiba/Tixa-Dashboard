
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Server,
  GitBranch,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TraceTimeline from '@/components/logs/TraceTimeline';
import JsonViewer from '@/components/logs/JsonViewer';
import { useLogDetail } from '@/hooks/useLogs';

export default function LogDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: log, loading, error } = useLogDetail(id);

  // State for toggling sections (Timeline, ReAct, etc.)
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
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // --- EARLY RETURNS (Must be inside the component) ---

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading log details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center flex-col">
          <div className="text-red-600 mb-4">Error: {error.message}</div>
          <Link href="/logs" className="text-primary hover:underline">
            Back to Logs
          </Link>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center flex-col">
          <div className="text-gray-500 mb-4">Log not found</div>
          <Link href="/logs" className="text-primary hover:underline">
            Back to Logs
          </Link>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---

  const confidenceScore = log.metrics?.overall_confidence 
    ? (log.metrics.overall_confidence * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Log Detail" 
          description={`Transaction ID: ${log.ticket_id || log.id}`}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <Link 
            href="/logs"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Logs
          </Link>

          {/* SECTION 1: Header / Context */}
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

          {/* SECTION 2: Key Metrics */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Timeline & Trace */}
            <div className="space-y-6">
              
              {/* Timeline Section */}
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
              {/* Detailed Metrics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h3>
                <JsonViewer data={log.metrics || {}} />
              </div>

              {/* Retrieval Data */}
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
                       <JsonViewer data={log.trace.retrieval} collapsed={true} />
                    </div>
                  )}
                </div>
              )}

              {/* Full Trace / Payload */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Payload</h3>
                <JsonViewer data={log.trace || {}} collapsed={true} />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading log details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">Error loading log: {error.message}</div>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Log not found</div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      SUCCESS: 'bg-green-100 text-green-800',
      ERROR: 'bg-red-100 text-red-800',
      FAILED: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Log Detail" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <Link 
            href="/logs"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Logs
          </Link>

          {/* SECTION 1: Header / Context */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {log.ticket_id || 'No Ticket ID'}
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
                    Environment: <span className="font-medium ml-1">{log.environment}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    Version: <span className="font-medium ml-1">{log.workflow_version}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(log.executed_at), 'MMM dd, yyyy HH:mm:ss')}
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

          {/* SECTION 2: Key Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600">Execution Time</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {log.execution_time_seconds?.toFixed(2)}s
              </p>
            </div>
            
            {log.metrics?.react_iterations && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-600">ReACT Iterations</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {log.metrics.react_iterations}
                </p>
              </div>
            )}

            {log.metrics?.overall_confidence !== undefined && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-600">Overall Confidence</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {(log.metrics.overall_confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}

            {log.metrics?.hallucination_risk !== undefined && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-600">Hallucination Risk</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {(log.metrics.hallucination_risk * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: Execution Timeline */}
          {log.trace?.timeline && log.trace.timeline.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-4"
              >
                <span>Execution Timeline</span>
                {expandedSections.has('timeline') ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
              
              {expandedSections.has('timeline') && (
                <TraceTimeline timeline={log.trace.timeline} />
              )}
            </div>
          )}

          {/* SECTION 4: ReACT Reasoning */}
          {log.trace?.react && log.trace.react.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <button
                onClick={() => toggleSection('react')}
                className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-4"
              >
                <span>ReACT Reasoning</span>
                {expandedSections.has('react') ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>

              {expandedSections.has('react') && (
                <div className="space-y-4">
                  {log.trace.react.map((iteration, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Iteration {iteration.iteration}
                        </span>
                        <span className="text-xs text-gray-500">
                          {iteration.timestamp && format(new Date(iteration.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Thought:</p>
                          <p className="text-gray-600 mt-1">{iteration.thought}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700">Action:</p>
                          <p className="text-gray-600 mt-1">{iteration.action}</p>
                        </div>

                        {iteration.tool_call && (
                          <div>
                            <p className="font-medium text-gray-700">Tool Call:</p>
                            <code className="block bg-gray-50 p-2 rounded mt-1 text-xs">
                              {iteration.tool_call}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: Retrieval & Evidence */}
          {log.trace?.retrieval && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <button
                onClick={() => toggleSection('retrieval')}
                className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 mb-4"
              >
                <span>Retrieval & Evidence</span>
                {expandedSections.has('retrieval') ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>

              {expandedSections.has('retrieval') && (
                <div className="text-sm text-gray-600">
                  <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
                    {JSON.stringify(log.trace.retrieval, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: Final Output */}
          {log.trace?.output && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Output</h3>
              <div className="space-y-3">
                {log.trace.output.response && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Response:</p>
                    <p className="text-sm text-gray-600 mt-1">{log.trace.output.response}</p>
                  </div>
                )}
                {log.trace.output.resolution && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Resolution:</p>
                    <p className="text-sm text-gray-600 mt-1">{log.trace.output.resolution}</p>
                  </div>
                )}
                {log.trace.output.tags && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {log.trace.output.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 7: Raw Payload */}
          <JsonViewer data={log.payload || log} />
        </main>
      </div>
    </div>
  );
}

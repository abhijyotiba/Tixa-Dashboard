'use client';

import { useState } from 'react';
import { LogDetail } from '@/types/logs';
import { 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  MessageSquare, 
  FileJson, 
  AlertTriangle,
  Tag,
  Search,
  FileText,
  Settings,
  Zap,
  Clock,
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

interface TraceTimelineProps {
  trace?: LogDetail['trace'];
}

// Map event types to icons and colors – includes dark mode styles
function getEventStyle(type: string, _event: string) {
  const styles: Record<string, { bg: string; border: string; text: string; badge: string; icon: React.ReactNode }> = {
    'SUCCESS': { 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400', 
      badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800',
      icon: <CheckCircle2 className="h-4 w-4" /> 
    },
    'ERROR': { 
      bg: 'bg-red-50 dark:bg-red-900/20', 
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400', 
      badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',
      icon: <XCircle className="h-4 w-4" /> 
    },
    'CLASSIFICATION': { 
      bg: 'bg-purple-50 dark:bg-purple-900/20', 
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400', 
      badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800',
      icon: <Tag className="h-4 w-4" /> 
    },
    'GENERATION': { 
      bg: 'bg-blue-50 dark:bg-blue-900/20', 
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400', 
      badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800',
      icon: <FileText className="h-4 w-4" /> 
    },
    'DECISION': { 
      bg: 'bg-amber-50 dark:bg-amber-900/20', 
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400', 
      badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800',
      icon: <Settings className="h-4 w-4" /> 
    },
    'RULES': { 
      bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-600 dark:text-indigo-400', 
      badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800',
      icon: <Zap className="h-4 w-4" /> 
    },
    'UPDATE': { 
      bg: 'bg-cyan-50 dark:bg-cyan-900/20', 
      border: 'border-cyan-200 dark:border-cyan-800',
      text: 'text-cyan-600 dark:text-cyan-400', 
      badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-200 dark:ring-cyan-800',
      icon: <CheckCircle2 className="h-4 w-4" /> 
    },
  };
  return styles[type] || { 
    bg: 'bg-gray-50 dark:bg-gray-800', 
    border: 'border-gray-200 dark:border-gray-700',
    text: 'text-gray-600 dark:text-gray-400', 
    badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600',
    icon: <FileJson className="h-4 w-4" /> 
  };
}

// Format event name for display
function formatEventName(event: string): string {
  return event
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Collapsible timeline card
function TimelineCard({ 
  children, 
  icon, 
  title, 
  subtitle,
  stepNumber,
  colorClasses,
  defaultOpen = true, 
}: { 
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  stepNumber?: number;
  colorClasses: { bg: string; border: string; text: string };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0 group">
      {/* Connector line */}
      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-gray-300 dark:from-gray-600 to-transparent group-last:hidden" />
      
      {/* Step indicator */}
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-xl ${colorClasses.bg} border ${colorClasses.border} flex items-center justify-center shadow-sm`}>
        <span className={colorClasses.text}>{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 text-left group/btn"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {stepNumber !== undefined && (
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Step {stepNumber}
                </span>
              )}
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</h4>
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <span className="text-gray-400 dark:text-gray-500 transition-transform duration-200">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </button>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'mt-3 max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Duration bar visualization
function DurationBar({ seconds, maxSeconds }: { seconds: number; maxSeconds: number }) {
  const pct = maxSeconds > 0 ? Math.min((seconds / maxSeconds) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums whitespace-nowrap">
        {seconds.toFixed(2)}s
      </span>
    </div>
  );
}

export default function TraceTimeline({ trace }: TraceTimelineProps) {
  const [showAllDetails, setShowAllDetails] = useState(false);

  if (!trace) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
        <Activity className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No trace data available</p>
        <p className="text-xs mt-1">Execution trace will appear here when available</p>
      </div>
    );
  }

  // Handle nested structure
  const actualTrace = trace.trace && (
    trace.trace.audit_events || trace.trace.react_iterations || trace.trace.product
  ) ? trace.trace : trace;

  const auditEvents = Array.isArray(actualTrace.audit_events) ? actualTrace.audit_events : [];
  const reactIterations = Array.isArray(actualTrace.react_iterations) ? actualTrace.react_iterations : 
                          Array.isArray(actualTrace.react) ? actualTrace.react : [];
  const hasProduct = actualTrace.product?.identified;
  const legacyTimeline = Array.isArray(actualTrace.timeline) ? actualTrace.timeline : [];
  const legacyOutput = actualTrace.output;

  const hasNewFormat = auditEvents.length > 0 || reactIterations.length > 0 || hasProduct;
  const hasLegacyFormat = legacyTimeline.length > 0 || legacyOutput;

  // Calculate max duration for bars
  const allDurations = [
    ...auditEvents.map((e: any) => e.details?.duration_seconds || 0),
    ...reactIterations.map((r: any) => r.duration || 0),
    ...legacyTimeline.map((n: any) => n.duration_seconds || 0),
  ];
  const maxDuration = Math.max(...allDurations, 0.01);

  if (!hasNewFormat && !hasLegacyFormat) {
    const payloadKeys = Object.keys(actualTrace);
    
    if (payloadKeys.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
          <Layers className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Payload is empty</p>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-300 font-medium">Timeline structure not detected</p>
            <p className="text-amber-600 dark:text-amber-400/80 mt-1 text-xs">
              Available fields: {payloadKeys.map(k => (
                <code key={k} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-[11px] mx-0.5 font-mono">{k}</code>
              ))}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalSteps = (hasProduct ? 1 : 0) + auditEvents.length + reactIterations.length + legacyTimeline.length + (legacyOutput ? 1 : 0);

  return (
    <div className="relative">
      {/* Summary Bar */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {totalSteps} step{totalSteps !== 1 ? 's' : ''} in trace
          </span>
          {auditEvents.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800">
              {auditEvents.length} audit events
            </span>
          )}
          {reactIterations.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 ring-1 ring-violet-200 dark:ring-violet-800">
              {reactIterations.length} ReAct iterations
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAllDetails(!showAllDetails)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title={showAllDetails ? 'Collapse details' : 'Expand details'}
        >
          {showAllDetails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showAllDetails ? 'Collapse' : 'Expand'} all
        </button>
      </div>

      <div className="space-y-0">
        {/* Product Identification */}
        {hasProduct && actualTrace.product?.identified && (
          <TimelineCard
            icon={<Search className="h-4 w-4" />}
            title="Product Identified"
            subtitle={actualTrace.product.identified.name}
            stepNumber={1}
            colorClasses={{ bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' }}
            defaultOpen={true}
          >
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Name</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{actualTrace.product.identified.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Model</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{actualTrace.product.identified.model}</p>
                </div>
                {actualTrace.product.identified.category && (
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{actualTrace.product.identified.category}</p>
                  </div>
                )}
                {actualTrace.product.confidence !== undefined && (
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Confidence</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${actualTrace.product.confidence <= 1 ? actualTrace.product.confidence * 100 : actualTrace.product.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                        {actualTrace.product.confidence <= 1 ? (actualTrace.product.confidence * 100).toFixed(0) : actualTrace.product.confidence.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TimelineCard>
        )}

        {/* Audit Events */}
        {auditEvents.map((event: any, index: number) => {
          const style = getEventStyle(event.type, event.event);
          const stepNum = (hasProduct ? 2 : 1) + index;
          return (
            <TimelineCard
              key={`audit-${index}`}
              icon={style.icon}
              title={formatEventName(event.event)}
              subtitle={event.type}
              stepNumber={stepNum}
              colorClasses={style}
              defaultOpen={showAllDetails || index === 0}
            >
              <div className="space-y-2">
                {/* Type Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                    {event.type}
                  </span>
                  {event.timestamp && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                {event.details && (
                  <div className={`p-3 rounded-lg border ${style.border} ${style.bg}`}>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {event.details.category && (
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</span>
                          <p className="text-gray-800 dark:text-gray-200 mt-0.5 font-medium">{event.details.category}</p>
                        </div>
                      )}
                      {event.details.confidence !== undefined && (
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Confidence</span>
                          <p className="text-gray-800 dark:text-gray-200 mt-0.5 font-mono">
                            {event.details.confidence <= 1 ? (event.details.confidence * 100).toFixed(0) : event.details.confidence.toFixed(0)}%
                          </p>
                        </div>
                      )}
                      {event.details.iterations !== undefined && (
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Iterations</span>
                          <p className="text-gray-800 dark:text-gray-200 mt-0.5">{event.details.iterations}</p>
                        </div>
                      )}
                      {event.details.resolution_status && (
                        <div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Resolution</span>
                          <p className="text-gray-800 dark:text-gray-200 mt-0.5">{event.details.resolution_status}</p>
                        </div>
                      )}
                    </div>
                    {event.details.duration_seconds !== undefined && (
                      <DurationBar seconds={event.details.duration_seconds} maxSeconds={maxDuration} />
                    )}
                    {event.details.tags && event.details.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                        {event.details.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TimelineCard>
          );
        })}

        {/* ReAct Iterations */}
        {reactIterations.map((iter: any, index: number) => {
          const stepNum = (hasProduct ? 2 : 1) + auditEvents.length + index;
          return (
            <TimelineCard
              key={`react-${index}`}
              icon={<BrainCircuit className="h-4 w-4" />}
              title={`ReAct Iteration ${iter.iteration || index + 1}`}
              subtitle={iter.action || 'Reasoning step'}
              stepNumber={stepNum}
              colorClasses={{ bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-600 dark:text-violet-400' }}
              defaultOpen={showAllDetails || index === 0}
            >
              <div className="space-y-2.5">
                {iter.duration !== undefined && (
                  <DurationBar seconds={iter.duration} maxSeconds={maxDuration} />
                )}

                {/* Thought */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Thought</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{iter.thought || 'No thought recorded'}</p>
                </div>
                
                {/* Action */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">Action</span>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                    {iter.action}
                  </p>
                  {iter.action_input && (
                    <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800/50">
                      <span className="text-[10px] font-medium text-blue-400 dark:text-blue-500 uppercase">Input</span>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 font-mono mt-0.5 break-all">
                        {typeof iter.action_input === 'string' 
                          ? iter.action_input 
                          : JSON.stringify(iter.action_input, null, 2).slice(0, 200) + (JSON.stringify(iter.action_input).length > 200 ? '…' : '')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Observation */}
                {iter.observation && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Observation</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                      {iter.observation}
                    </p>
                  </div>
                )}
              </div>
            </TimelineCard>
          );
        })}

        {/* Legacy Timeline Nodes */}
        {legacyTimeline.map((node: any, index: number) => {
          const isSuccess = node.status === 'success';
          const stepNum = (hasProduct ? 2 : 1) + auditEvents.length + reactIterations.length + index;
          return (
            <TimelineCard
              key={`node-${index}`}
              icon={isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              title={node.node_name || 'Unknown Step'}
              subtitle={isSuccess ? 'Completed' : 'Failed'}
              stepNumber={stepNum}
              colorClasses={isSuccess 
                ? { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' }
                : { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600 dark:text-red-400' }
              }
              defaultOpen={!isSuccess || showAllDetails}
            >
              <div className="space-y-2">
                {typeof node.duration_seconds === 'number' && (
                  <DurationBar seconds={node.duration_seconds} maxSeconds={maxDuration} />
                )}
                {node.error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 text-xs rounded-lg border border-red-100 dark:border-red-800/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <XCircle className="h-3 w-3" />
                      <span className="font-semibold text-[10px] uppercase tracking-wider">Error</span>
                    </div>
                    {node.error}
                  </div>
                )}
              </div>
            </TimelineCard>
          );
        })}

        {/* Final Output (legacy) */}
        {legacyOutput && (
          <TimelineCard
            icon={<MessageSquare className="h-4 w-4" />}
            title="Final Resolution"
            stepNumber={totalSteps}
            colorClasses={{ bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400' }}
            defaultOpen={true}
          >
            <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/50">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {legacyOutput.response || 'No response text available'}
              </p>
              {legacyOutput.tags && legacyOutput.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-purple-100 dark:border-purple-800/50">
                  {legacyOutput.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 text-[11px] bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 rounded-full ring-1 ring-purple-200 dark:ring-purple-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </TimelineCard>
        )}
      </div>
    </div>
  );
}

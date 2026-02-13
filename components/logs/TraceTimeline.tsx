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
  Clock
} from 'lucide-react';

interface TraceTimelineProps {
  trace?: LogDetail['trace'];
}

// Map event types to icons and colors
function getEventStyle(type: string, event: string) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    'SUCCESS': { bg: 'bg-green-100', text: 'text-green-600', icon: <CheckCircle2 className="h-5 w-5" /> },
    'ERROR': { bg: 'bg-red-100', text: 'text-red-600', icon: <XCircle className="h-5 w-5" /> },
    'CLASSIFICATION': { bg: 'bg-purple-100', text: 'text-purple-600', icon: <Tag className="h-5 w-5" /> },
    'GENERATION': { bg: 'bg-blue-100', text: 'text-blue-600', icon: <FileText className="h-5 w-5" /> },
    'DECISION': { bg: 'bg-amber-100', text: 'text-amber-600', icon: <Settings className="h-5 w-5" /> },
    'RULES': { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: <Zap className="h-5 w-5" /> },
    'UPDATE': { bg: 'bg-cyan-100', text: 'text-cyan-600', icon: <CheckCircle2 className="h-5 w-5" /> },
  };
  return styles[type] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: <FileJson className="h-5 w-5" /> };
}

// Format event name for display
function formatEventName(event: string): string {
  return event
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function TraceTimeline({ trace }: TraceTimelineProps) {
  if (!trace) {
    return (
      <div className="text-center text-gray-500 py-8">
        No trace data available
      </div>
    );
  }

  // Handle nested structure: payload may have { trace: {...}, private_note, final_response }
  // If trace.trace exists and has the actual data, use that instead
  const actualTrace = trace.trace && (
    trace.trace.audit_events || 
    trace.trace.react_iterations || 
    trace.trace.product
  ) ? trace.trace : trace;

  // Check for your actual payload structure
  const auditEvents = Array.isArray(actualTrace.audit_events) ? actualTrace.audit_events : [];
  const reactIterations = Array.isArray(actualTrace.react_iterations) ? actualTrace.react_iterations : 
                          Array.isArray(actualTrace.react) ? actualTrace.react : [];
  const hasProduct = actualTrace.product?.identified;
  const hasPlanning = actualTrace.planning?.execution_plan;
  const hasRetrieval = actualTrace.retrieval;

  // Check for legacy structure
  const legacyTimeline = Array.isArray(actualTrace.timeline) ? actualTrace.timeline : [];
  const legacyOutput = actualTrace.output;

  // Determine which format we're dealing with
  const hasNewFormat = auditEvents.length > 0 || reactIterations.length > 0 || hasProduct;
  const hasLegacyFormat = legacyTimeline.length > 0 || legacyOutput;

  // If neither format has data, show available fields
  if (!hasNewFormat && !hasLegacyFormat) {
    const payloadKeys = Object.keys(actualTrace);
    
    if (payloadKeys.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <FileJson className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
          <p>Payload is empty</p>
        </div>
      );
    }

    return (
      <div className="py-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-300 font-medium">Timeline structure not detected</p>
            <p className="text-amber-700 dark:text-amber-400 mt-1">
              Available fields: {payloadKeys.map(k => <code key={k} className="bg-amber-100 dark:bg-amber-800 px-1 rounded mx-0.5">{k}</code>)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-600" />

      <div className="space-y-6">
        
        {/* Product Identification (if available) */}
        {hasProduct && actualTrace.product?.identified && (
          <div className="relative flex items-start">
            <div className="absolute left-0 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center z-10">
              <Search className="h-5 w-5" />
            </div>
            <div className="ml-14 pt-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Product Identified</h4>
              <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-100 dark:border-emerald-800">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">{actualTrace.product.identified.name}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Model: {actualTrace.product.identified.model}</p>
                {actualTrace.product.identified.category && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">{actualTrace.product.identified.category}</p>
                )}
                {actualTrace.product.confidence !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                      Confidence: {actualTrace.product.confidence <= 1 ? (actualTrace.product.confidence * 100).toFixed(0) : actualTrace.product.confidence.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audit Events Timeline */}
        {auditEvents.map((event: any, index: number) => {
          const style = getEventStyle(event.type, event.event);
          return (
            <div key={`audit-${index}`} className="relative flex items-start">
              <div className={`absolute left-0 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center z-10 ${style.bg} ${style.text}`}>
                {style.icon}
              </div>
              <div className="ml-14 pt-1 w-full">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatEventName(event.event)}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                    {event.type}
                  </span>
                </div>
                
                {event.details && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 text-xs">
                    {/* Show key details based on event type */}
                    {event.details.category && (
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Category:</span> {event.details.category}</p>
                    )}
                    {event.details.confidence !== undefined && (
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Confidence:</span> {event.details.confidence <= 1 ? (event.details.confidence * 100).toFixed(0) : event.details.confidence.toFixed(0)}%</p>
                    )}
                    {event.details.iterations !== undefined && (
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Iterations:</span> {event.details.iterations}</p>
                    )}
                    {event.details.duration_seconds !== undefined && (
                      <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Clock className="h-3 w-3" />
                        <span>{event.details.duration_seconds.toFixed(2)}s</span>
                      </p>
                    )}
                    {event.details.resolution_status && (
                      <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Resolution:</span> {event.details.resolution_status}</p>
                    )}
                    {event.details.tags && event.details.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.details.tags.map((tag: string) => (
                          <span key={tag} className="bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-gray-200 px-1.5 py-0.5 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ReAct Iterations */}
        {reactIterations.map((iter: any, index: number) => (
          <div key={`react-${index}`} className="relative flex items-start">
            <div className="absolute left-0 w-10 h-10 rounded-full border-2 border-white bg-blue-100 text-blue-600 shadow-sm flex items-center justify-center z-10">
              <BrainCircuit className="h-5 w-5" />
            </div>
            
            <div className="ml-14 pt-1 w-full">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  ReAct Step {iter.iteration}
                </h4>
                {iter.duration && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {iter.duration.toFixed(2)}s
                  </span>
                )}
              </div>
              
              <div className="mt-2 space-y-3">
                {/* Thought */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-100 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Thought</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-3">{iter.thought || 'No thought recorded'}</p>
                </div>
                
                {/* Action */}
                <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                  <span className="text-xs font-bold text-blue-600 dark:text-white uppercase tracking-wide">Action</span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-mono">
                    {iter.action}
                    {iter.action_input && (
                      <span className="block mt-1 text-xs text-blue-700 dark:text-white font-normal">
                        Input: {typeof iter.action_input === 'string' 
                          ? iter.action_input 
                          : JSON.stringify(iter.action_input, null, 2).slice(0, 100) + '...'}
                      </span>
                    )}
                  </p>
                </div>

                {/* Observation */}
                {iter.observation && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Observation</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                      {iter.observation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Legacy Timeline Nodes (if using old format) */}
        {legacyTimeline.map((node: any, index: number) => (
          <div key={`node-${index}`} className="relative flex items-start group">
            <div className={`
              absolute left-0 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center z-10
              ${node.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}
            `}>
              {node.status === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            
            <div className="ml-14 pt-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {node.node_name || 'Unknown Step'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Duration: {typeof node.duration_seconds === 'number' ? node.duration_seconds.toFixed(3) : '0.000'}s
              </p>
              {node.error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded border border-red-100 dark:border-red-800">
                  {node.error}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Final Output (legacy format) */}
        {legacyOutput && (
          <div className="relative flex items-start">
            <div className="absolute left-0 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm flex items-center justify-center z-10">
              <MessageSquare className="h-5 w-5" />
            </div>
            
            <div className="ml-14 pt-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Final Resolution</h4>
              <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {legacyOutput.response || 'No response text available'}
                </p>
                {legacyOutput.tags && legacyOutput.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {legacyOutput.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

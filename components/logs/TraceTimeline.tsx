import { LogDetail } from '@/types/logs';
import { CheckCircle2, XCircle, BrainCircuit, MessageSquare } from 'lucide-react';

interface TraceTimelineProps {
  trace?: LogDetail['trace'];
}

export default function TraceTimeline({ trace }: TraceTimelineProps) {
  if (!trace) {
    return (
      <div className="text-center text-gray-500 py-8">
        No trace data available
      </div>
    );
  }

  // FIX: Safe access using Array.isArray()
  // If the data is missing or not an array, default to [] to prevent crashes
  const timelineNodes = Array.isArray(trace.timeline) ? trace.timeline : [];
  const reactIterations = Array.isArray(trace.react) ? trace.react : [];
  const outputTags = trace.output?.tags && Array.isArray(trace.output.tags) ? trace.output.tags : [];

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-8">
        {/* Standard Timeline Nodes */}
        {timelineNodes.map((node, index) => (
          <div key={`node-${index}`} className="relative flex items-start group">
            <div className={`
              absolute left-0 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
              ${node.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
            `}>
              {node.status === 'success' ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <XCircle className="h-6 w-6" />
              )}
            </div>
            
            <div className="ml-16 pt-1">
              <h4 className="text-sm font-semibold text-gray-900">
                {node.node_name || 'Unknown Step'}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Duration: {typeof node.duration_seconds === 'number' ? node.duration_seconds.toFixed(3) : '0.000'}s
              </p>
              {node.error && (
                <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">
                  {node.error}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ReAct Iterations */}
        {reactIterations.map((iter, index) => (
          <div key={`react-${index}`} className="relative flex items-start">
            <div className="absolute left-0 w-12 h-12 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-sm flex items-center justify-center z-10">
              <BrainCircuit className="h-6 w-6" />
            </div>
            
            <div className="ml-16 pt-1 w-full">
              <h4 className="text-sm font-semibold text-gray-900">
                ReAct Step {iter.iteration}
              </h4>
              <div className="mt-2 space-y-3">
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thought</span>
                  <p className="text-sm text-gray-700 mt-1">{iter.thought || 'No thought recorded'}</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Action</span>
                  <p className="text-sm text-gray-800 mt-1 font-mono">
                    {iter.action}
                    {iter.tool_call && (
                      <span className="block mt-1 text-xs text-blue-700 font-normal">
                        Input: {iter.tool_call}
                      </span>
                    )}
                  </p>
                </div>

                {iter.tool_result && (
                  <div className="bg-green-50 p-3 rounded-md border border-green-100">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Observation</span>
                    <pre className="text-xs text-gray-700 mt-1 overflow-x-auto whitespace-pre-wrap">
                      {typeof iter.tool_result === 'string' 
                        ? iter.tool_result 
                        : JSON.stringify(iter.tool_result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Final Output */}
        {trace.output && (
          <div className="relative flex items-start">
            <div className="absolute left-0 w-12 h-12 rounded-full border-4 border-white bg-purple-100 text-purple-600 shadow-sm flex items-center justify-center z-10">
              <MessageSquare className="h-6 w-6" />
            </div>
            
            <div className="ml-16 pt-1">
              <h4 className="text-sm font-semibold text-gray-900">
                Final Resolution
              </h4>
              <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                <p className="text-sm text-gray-800">
                  {trace.output.response || 'No response text available'}
                </p>
                {/* FIX: Use safe outputTags array here */}
                {outputTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {outputTags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-white text-purple-700 rounded border border-purple-200">
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

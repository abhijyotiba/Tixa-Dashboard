'use client';

import { format } from 'date-fns';
import { TimelineNode } from '@/types/logs';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

interface TraceTimelineProps {
  timeline?: TimelineNode[];
}

export default function TraceTimeline({ timeline }: TraceTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No timeline data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((node, index) => (
        <div key={index} className="flex">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center mr-4">
            {node.status === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : node.status === 'failed' ? (
              <XCircle className="h-6 w-6 text-red-500" />
            ) : (
              <Circle className="h-6 w-6 text-gray-400" />
            )}
            {index < timeline.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2" />
            )}
          </div>

          {/* Timeline content */}
          <div className="flex-1 pb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {node.node_name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(node.start_time), 'HH:mm:ss.SSS')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {node.duration_seconds.toFixed(3)}s
                  </p>
                  <p className={`text-xs ${
                    node.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {node.status}
                  </p>
                </div>
              </div>
              {node.error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {node.error}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  defaultExpanded?: boolean;
  title?: string;
}

export default function JsonViewer({ data, defaultExpanded = false, title = "Raw JSON Payload" }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!data) {
    return <div className="text-gray-500 dark:text-gray-400 text-sm">No data available</div>;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
          <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-96 bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-600 whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

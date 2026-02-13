'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Search, Code2, Braces } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  defaultExpanded?: boolean;
  title?: string;
  maxHeight?: string;
  showHeader?: boolean;
}

// Syntax-highlighted JSON node renderer
function JsonNode({ 
  keyName, 
  value, 
  depth = 0, 
  isLast = true,
  defaultOpen = true,
  searchTerm = '',
}: { 
  keyName?: string; 
  value: any; 
  depth?: number; 
  isLast?: boolean;
  defaultOpen?: boolean;
  searchTerm?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen && depth < 2);
  
  const indent = depth * 16;
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-white rounded px-0.5">{text.slice(idx, idx + searchTerm.length)}</mark>
        {text.slice(idx + searchTerm.length)}
      </>
    );
  };

  const renderValue = (val: any) => {
    if (val === null) return <span className="text-orange-500 dark:text-orange-400 italic">null</span>;
    if (val === undefined) return <span className="text-gray-400 italic">undefined</span>;
    if (typeof val === 'boolean') return <span className="text-purple-600 dark:text-purple-400">{val.toString()}</span>;
    if (typeof val === 'number') return <span className="text-cyan-600 dark:text-cyan-400">{val}</span>;
    if (typeof val === 'string') {
      const display = val.length > 300 ? val.slice(0, 300) + '…' : val;
      return <span className="text-emerald-600 dark:text-emerald-400">&quot;{highlightMatch(display)}&quot;</span>;
    }
    return <span>{String(val)}</span>;
  };

  if (!isExpandable) {
    return (
      <div className="flex items-start leading-6 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 rounded" style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span className="text-blue-700 dark:text-blue-300 font-medium shrink-0">&quot;{highlightMatch(keyName)}&quot;</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        {renderValue(value)}
        {!isLast && <span className="text-gray-400">,</span>}
      </div>
    );
  }

  const entries = isArray ? value : Object.entries(value);
  const count = isArray ? value.length : Object.keys(value).length;
  const bracket = isArray ? ['[', ']'] : ['{', '}'];

  if (count === 0) {
    return (
      <div className="flex items-start leading-6 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 rounded" style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span className="text-blue-700 dark:text-blue-300 font-medium">&quot;{highlightMatch(keyName)}&quot;</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-600 dark:text-gray-400">{bracket[0]}{bracket[1]}</span>
        {!isLast && <span className="text-gray-400">,</span>}
      </div>
    );
  }

  return (
    <div>
      <div 
        className="flex items-center leading-6 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/30 rounded group"
        style={{ paddingLeft: indent }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-400 mr-1 transition-transform duration-150 select-none">
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>
        {keyName !== undefined && (
          <>
            <span className="text-blue-700 dark:text-blue-300 font-medium">&quot;{highlightMatch(keyName)}&quot;</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-600 dark:text-gray-400">{bracket[0]}</span>
        {!isOpen && (
          <>
            <span className="text-gray-400 text-xs mx-1">
              {count} {count === 1 ? (isArray ? 'item' : 'key') : (isArray ? 'items' : 'keys')}
            </span>
            <span className="text-gray-600 dark:text-gray-400">{bracket[1]}</span>
            {!isLast && <span className="text-gray-400">,</span>}
          </>
        )}
      </div>
      {isOpen && (
        <>
          {isArray ? (
            value.map((item: any, i: number) => (
              <JsonNode
                key={i}
                value={item}
                depth={depth + 1}
                isLast={i === value.length - 1}
                defaultOpen={depth < 1}
                searchTerm={searchTerm}
              />
            ))
          ) : (
            Object.entries(value).map(([k, v], i, arr) => (
              <JsonNode
                key={k}
                keyName={k}
                value={v}
                depth={depth + 1}
                isLast={i === arr.length - 1}
                defaultOpen={depth < 1}
                searchTerm={searchTerm}
              />
            ))
          )}
          <div className="leading-6" style={{ paddingLeft: indent }}>
            <span className="text-gray-600 dark:text-gray-400">{bracket[1]}</span>
            {!isLast && <span className="text-gray-400">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function JsonViewer({ 
  data, 
  defaultExpanded = false, 
  title = "Raw JSON Payload",
  maxHeight = 'max-h-[500px]',
  showHeader = true,
}: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');

  const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = jsonString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [jsonString]);

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <div className="flex items-center justify-center py-6 text-gray-400 dark:text-gray-500 text-sm gap-2">
        <Braces className="h-4 w-4" />
        No data available
      </div>
    );
  }

  if (!showHeader) {
    return (
      <div className={`${maxHeight} overflow-auto font-mono text-xs p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700`}>
        {viewMode === 'tree' ? (
          <JsonNode value={data} defaultOpen={true} searchTerm={searchTerm} />
        ) : (
          <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">{jsonString}</pre>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span className="transition-transform duration-200">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          {title}
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">
            {typeof data === 'object' ? `${Object.keys(data).length} keys` : ''}
          </span>
        </button>

        {isExpanded && (
          <div className="flex items-center gap-1">
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'tree' ? 'raw' : 'tree')}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={viewMode === 'tree' ? 'Switch to raw view' : 'Switch to tree view'}
            >
              {viewMode === 'tree' ? <Code2 className="h-3.5 w-3.5" /> : <Braces className="h-3.5 w-3.5" />}
            </button>
            {/* Search Toggle */}
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchTerm(''); }}
              className={`p-1.5 rounded-md transition-colors ${
                showSearch 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Search JSON"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copy JSON"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {isExpanded && showSearch && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keys & values..."
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-900 dark:text-gray-100 placeholder-gray-400"
            autoFocus
          />
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className={`${maxHeight} overflow-auto font-mono text-xs p-4 bg-white dark:bg-gray-900/50`}>
          {viewMode === 'tree' ? (
            <JsonNode value={data} defaultOpen={true} searchTerm={searchTerm} />
          ) : (
            <pre className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 leading-6">{jsonString}</pre>
          )}
        </div>
      )}
    </div>
  );
}

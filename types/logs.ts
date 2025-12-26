// Type definitions matching the central-logger backend

export interface WorkflowLog {
  id: string;
  client_id: string;
  environment: string;
  workflow_version: string;
  ticket_id: string;
  executed_at: string;
  execution_time_seconds: number;
  status: 'SUCCESS' | 'ERROR' | 'PARTIAL' | 'FAILED';
  category: string;
  resolution_status?: string;
  metrics?: LogMetrics;
  payload?: any;
  created_at: string;
}

export interface LogMetrics {
  react_iterations?: number;
  overall_confidence?: number;
  hallucination_risk?: number;
  product_confidence?: number;
  cpu_usage?: number;
  memory_mb?: number;
  [key: string]: any;
}

export interface LogDetail extends WorkflowLog {
  trace?: {
    timeline?: TimelineNode[];
    react?: ReActIteration[];
    retrieval?: RetrievalData;
    output?: FinalOutput;
  };
}

export interface TimelineNode {
  node_name: string;
  start_time: string;
  duration_seconds: number;
  status: 'success' | 'failed';
  error?: string;
}

export interface ReActIteration {
  iteration: number;
  thought: string;
  action: string;
  tool_call?: string;
  tool_result?: any;
  timestamp: string;
}

export interface RetrievalData {
  text_hits?: RetrievalHit[];
  image_matches?: ImageMatch[];
  document_refs?: DocumentRef[];
}

export interface RetrievalHit {
  content: string;
  score: number;
  source: string;
}

export interface ImageMatch {
  url: string;
  confidence: number;
  description?: string;
}

export interface DocumentRef {
  title: string;
  url: string;
  excerpt: string;
}

export interface FinalOutput {
  response: string;
  resolution: string;
  tags?: string[];
}

export interface LogsListResponse {
  items: WorkflowLog[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

export interface MetricsOverview {
  total_logs: number;
  success_rate: number;
  avg_execution_time: number;
  error_count: number;
  avg_confidence?: number;
  time_series?: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
  success_count?: number;
  error_count?: number;
}

export interface CategoryMetrics {
  category: string;
  count: number;
  success_rate: number;
  avg_execution_time: number;
}

export interface LogQueryParams {
  page?: number;
  page_size?: number;
  status?: string;
  category?: string;
  environment?: string;
  start_date?: string;
  end_date?: string;
  ticket_id?: string;
}

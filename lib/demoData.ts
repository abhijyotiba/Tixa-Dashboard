// Demo/sample data for new users with no logs
// This data is shown when a user has 0 real logs

import { MetricsOverview, WorkflowLog } from '@/types/logs';

export const DEMO_METRICS: MetricsOverview = {
  total_logs: 47,
  success_rate: 94.5,
  avg_execution_time: 12.3,
  error_count: 3,
  avg_confidence: 87.2,
  time_series: [
    { date: '2026-02-06', count: 5 },
    { date: '2026-02-07', count: 8 },
    { date: '2026-02-08', count: 12 },
    { date: '2026-02-09', count: 6 },
    { date: '2026-02-10', count: 9 },
    { date: '2026-02-11', count: 4 },
    { date: '2026-02-12', count: 3 },
  ],
};

export const DEMO_LOGS: WorkflowLog[] = [
  {
    id: 'demo-log-001',
    client_id: 'demo-client',
    environment: 'production',
    workflow_version: '1.0.0',
    ticket_id: 'DEMO-001',
    executed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    execution_time_seconds: 8.45,
    status: 'SUCCESS',
    category: 'order_inquiry',
    resolution_status: 'resolved',
    metrics: {
      react_iterations: 3,
      overall_confidence: 92.5,
      hallucination_risk: 0.05,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'demo-log-002',
    client_id: 'demo-client',
    environment: 'production',
    workflow_version: '1.0.0',
    ticket_id: 'DEMO-002',
    executed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    execution_time_seconds: 15.2,
    status: 'SUCCESS',
    category: 'product_support',
    resolution_status: 'resolved',
    metrics: {
      react_iterations: 5,
      overall_confidence: 88.0,
      hallucination_risk: 0.08,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'demo-log-003',
    client_id: 'demo-client',
    environment: 'production',
    workflow_version: '1.0.0',
    ticket_id: 'DEMO-003',
    executed_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    execution_time_seconds: 22.8,
    status: 'ERROR',
    category: 'refund_request',
    resolution_status: 'failed',
    metrics: {
      react_iterations: 7,
      overall_confidence: 45.0,
      hallucination_risk: 0.35,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const DEMO_BANNER_KEY = 'tixa_demo_banner_dismissed';

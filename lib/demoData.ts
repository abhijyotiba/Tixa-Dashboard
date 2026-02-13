// Demo/sample data for new users with no logs
// This data is shown when a user has 0 real logs

import { MetricsOverview, WorkflowLog, LogDetail } from '@/types/logs';

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

// Detailed demo log data for log detail pages
export const DEMO_LOG_DETAILS: Record<string, LogDetail> = {
  'demo-log-001': {
    ...DEMO_LOGS[0],
    trace: {
      audit_events: [
        {
          event: 'workflow_started',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          details: { category: 'order_inquiry' },
        },
        {
          event: 'classification_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
          details: { category: 'order_inquiry', confidence: 0.95 },
        },
        {
          event: 'retrieval_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
          details: { duration_seconds: 1.2 },
        },
        {
          event: 'workflow_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
          details: { resolution_status: 'resolved', duration_seconds: 8.45 },
        },
      ],
      react_iterations: [
        {
          iteration: 1,
          thought: 'The customer is asking about the status of their order #12345. I need to retrieve order information.',
          action: 'retrieve_order_status',
          tool_call: 'order_lookup',
          tool_result: { order_id: '12345', status: 'shipped', tracking: 'TRK123456' },
          timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        },
        {
          iteration: 2,
          thought: 'I have the order details. The order has been shipped with tracking number TRK123456.',
          action: 'format_response',
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        },
        {
          iteration: 3,
          thought: 'Response formatted. Ready to send to customer.',
          action: 'complete',
          timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        },
      ],
      retrieval: {
        text_hits: [
          { content: 'Order #12345 was placed on Feb 10, 2026', score: 0.95, source: 'orders_db' },
          { content: 'Shipping info: FedEx tracking TRK123456', score: 0.92, source: 'shipping_db' },
        ],
      },
      final_response: 'Your order #12345 has been shipped! You can track it using tracking number TRK123456 on the FedEx website. Expected delivery is within 2-3 business days.',
    },
  },
  'demo-log-002': {
    ...DEMO_LOGS[1],
    trace: {
      audit_events: [
        {
          event: 'workflow_started',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          details: { category: 'product_support' },
        },
        {
          event: 'classification_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000).toISOString(),
          details: { category: 'product_support', confidence: 0.88 },
        },
        {
          event: 'product_identified',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 120000).toISOString(),
          details: { confidence: 0.91 },
        },
        {
          event: 'retrieval_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 180000).toISOString(),
          details: { duration_seconds: 2.5 },
        },
        {
          event: 'workflow_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 900000).toISOString(),
          details: { resolution_status: 'resolved', duration_seconds: 15.2 },
        },
      ],
      react_iterations: [
        {
          iteration: 1,
          thought: 'Customer is asking how to set up their new wireless headphones. I need to identify the product model.',
          action: 'identify_product',
          tool_call: 'product_lookup',
          tool_result: { product: 'WH-1000XM5', category: 'headphones' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000).toISOString(),
        },
        {
          iteration: 2,
          thought: 'Product identified as WH-1000XM5 headphones. Retrieving setup instructions.',
          action: 'retrieve_documentation',
          tool_call: 'docs_search',
          tool_result: { found: true, doc_id: 'WH1000XM5-SETUP' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 180000).toISOString(),
        },
        {
          iteration: 3,
          thought: 'Found setup guide. Summarizing key steps for Bluetooth pairing.',
          action: 'summarize_steps',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 300000).toISOString(),
        },
        {
          iteration: 4,
          thought: 'Including troubleshooting tips in case of pairing issues.',
          action: 'add_troubleshooting',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 600000).toISOString(),
        },
        {
          iteration: 5,
          thought: 'Response complete with setup steps and troubleshooting.',
          action: 'complete',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 900000).toISOString(),
        },
      ],
      product: {
        identified: { name: 'Sony WH-1000XM5', model: 'WH-1000XM5', category: 'Wireless Headphones' },
        confidence: 0.91,
      },
      retrieval: {
        text_hits: [
          { content: 'WH-1000XM5 Quick Setup Guide: Press and hold power button for 7 seconds...', score: 0.97, source: 'product_docs' },
          { content: 'Bluetooth pairing mode: Blue light flashes rapidly when ready', score: 0.89, source: 'product_docs' },
        ],
      },
      final_response: 'To set up your WH-1000XM5 headphones:\n\n1. Press and hold the power button for 7 seconds until you hear "Bluetooth pairing"\n2. On your device, go to Bluetooth settings\n3. Select "WH-1000XM5" from the list\n4. You\'ll hear "Bluetooth connected" when paired\n\nIf pairing fails, try resetting the headphones by holding power + NC button for 7 seconds.',
    },
  },
  'demo-log-003': {
    ...DEMO_LOGS[2],
    trace: {
      audit_events: [
        {
          event: 'workflow_started',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          details: { category: 'refund_request' },
        },
        {
          event: 'classification_complete',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 60000).toISOString(),
          details: { category: 'refund_request', confidence: 0.82 },
        },
        {
          event: 'retrieval_complete',
          type: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 300000).toISOString(),
          details: { duration_seconds: 5.0 },
        },
        {
          event: 'policy_check_failed',
          type: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 600000).toISOString(),
          details: { reason: 'Unable to verify purchase within return window' },
        },
        {
          event: 'escalation_required',
          type: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 900000).toISOString(),
          details: { reason: 'Manual review needed' },
        },
        {
          event: 'workflow_complete',
          type: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1368000).toISOString(),
          details: { resolution_status: 'failed', duration_seconds: 22.8 },
        },
      ],
      react_iterations: [
        {
          iteration: 1,
          thought: 'Customer is requesting a refund for order #98765. Need to verify order details.',
          action: 'retrieve_order',
          tool_call: 'order_lookup',
          tool_result: { order_id: '98765', status: 'delivered', date: '2025-12-15' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 60000).toISOString(),
        },
        {
          iteration: 2,
          thought: 'Order was delivered on Dec 15, 2025. Checking return policy window.',
          action: 'check_policy',
          tool_call: 'policy_check',
          tool_result: { return_window: 30, days_since_delivery: 60, eligible: false },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 300000).toISOString(),
        },
        {
          iteration: 3,
          thought: 'Order is outside the 30-day return window. Checking for exceptions.',
          action: 'check_exceptions',
          tool_call: 'exception_lookup',
          tool_result: { exceptions: [], warranty_claim: false },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 600000).toISOString(),
        },
        {
          iteration: 4,
          thought: 'No applicable exceptions found. This case may require manager approval.',
          action: 'attempt_escalation',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 900000).toISOString(),
        },
        {
          iteration: 5,
          thought: 'Escalation system unavailable. Cannot proceed without manual intervention.',
          action: 'retry_escalation',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1100000).toISOString(),
        },
        {
          iteration: 6,
          thought: 'Second escalation attempt failed. Marking for human review.',
          action: 'mark_for_review',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1250000).toISOString(),
        },
        {
          iteration: 7,
          thought: 'Unable to resolve automatically. Workflow failed - requires human agent.',
          action: 'fail',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1368000).toISOString(),
        },
      ],
      retrieval: {
        text_hits: [
          { content: 'Standard return policy: 30 days from delivery date', score: 0.88, source: 'policies' },
          { content: 'Exceptions may apply for defective products with proof', score: 0.72, source: 'policies' },
        ],
      },
      final_response: 'I apologize, but I was unable to process your refund request automatically. Your order #98765 is outside our 30-day return window. This case has been escalated to our customer service team for manual review. You will receive an email within 24-48 hours.',
    },
  },
};

// Helper to check if an ID is a demo log
export function isDemoLogId(id: string): boolean {
  return id.startsWith('demo-log-');
}

// Get demo log detail by ID
export function getDemoLogDetail(id: string): LogDetail | null {
  return DEMO_LOG_DETAILS[id] || null;
}

export const DEMO_BANNER_KEY = 'tixa_demo_banner_dismissed';

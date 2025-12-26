'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/analytics/MetricCard';
import { useMetrics } from '@/hooks/useMetrics';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { data: metrics, loading, error } = useMetrics();

  const successRate = metrics?.success_rate ?? 0;
  const avgConfidence = metrics?.avg_confidence;

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">Error loading metrics: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          description="Overview of your workflow execution logs"
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Total Logs"
              value={(metrics?.total_logs ?? 0).toLocaleString()}
              icon={Activity}
            />

            <MetricCard
              title="Success Rate"
              value={`${(successRate * 100).toFixed(1)}%`}
              change={successRate > 0.9 ? '+2.5%' : undefined}
              changeType={successRate > 0.9 ? 'positive' : 'neutral'}
              icon={CheckCircle2}
            />

            <MetricCard
              title="Error Count"
              value={(metrics?.error_count ?? 0).toLocaleString()}
              icon={XCircle}
            />

            <MetricCard
              title="Avg Execution Time"
              value={`${(metrics?.avg_execution_time ?? 0).toFixed(2)}s`}
              icon={Clock}
            />
          </div>

          {/* Time Series Chart */}
          {(metrics?.time_series?.length ?? 0) > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Execution Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics!.time_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Metrics */}
          {typeof avgConfidence === 'number' && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Performance
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Confidence
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {(avgConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

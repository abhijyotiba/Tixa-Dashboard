'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/analytics/MetricCard';
import { useMetrics } from '@/hooks/useMetrics';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Time range options
const timeRanges = [
  { label: 'Today', value: 1 },
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
];

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const { data: metrics, loading, error } = useMetrics(selectedPeriod);

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
              value={`${successRate <= 1 ? (successRate * 100).toFixed(1) : successRate.toFixed(1)}%`}
              change={successRate > (successRate <= 1 ? 0.9 : 90) ? '+2.5%' : undefined}
              changeType={successRate > (successRate <= 1 ? 0.9 : 90) ? 'positive' : 'neutral'}
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

          {/* Time Series Chart - Tickets Processed Daily */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Tickets Processed
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Daily breakdown of processed tickets
                </p>
              </div>
              
              {/* Time Range Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedPeriod(range.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        selectedPeriod === range.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(metrics?.time_series?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={metrics!.time_series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric' 
                      });
                    }}
                    formatter={(value: number) => [value, 'Tickets']}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  >
                    {metrics!.time_series!.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill="#22c55e"
                        fillOpacity={0.9}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>No data available for this period</p>
                </div>
              </div>
            )}
          </div>

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
                    {avgConfidence <= 1 ? (avgConfidence * 100).toFixed(1) : avgConfidence.toFixed(1)}%
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

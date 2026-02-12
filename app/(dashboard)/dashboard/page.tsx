'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/analytics/MetricCard';
import { useMetrics } from '@/hooks/useMetrics';
import { useLogs } from '@/hooks/useLogs';
import { DEMO_METRICS, DEMO_BANNER_KEY } from '@/lib/demoData';
import { DashboardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';

// Lazy load the entire chart component - reduces initial bundle by ~80KB
const TimeSeriesChart = dynamic(
  () => import('@/components/charts/TimeSeriesChart'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    )
  }
);

// Time range options
const timeRanges = [
  { label: 'Today', value: 1 },
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
];

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const { data: metrics, loading, error } = useMetrics(selectedPeriod);
  const { data: logsData } = useLogs({ page: 1, page_size: 1 });
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  const hasRealData = (logsData?.total ?? 0) > 0;
  const isDemo = !loading && !hasRealData;
  
  const displayMetrics = isDemo ? DEMO_METRICS : metrics;
  const successRate = displayMetrics?.success_rate ?? 0;
  const avgConfidence = displayMetrics?.avg_confidence;
  const totalLogsCount = isDemo ? DEMO_METRICS.total_logs : (logsData?.total ?? metrics?.total_logs ?? 0);

  useEffect(() => {
    if (isDemo) {
      const dismissed = localStorage.getItem(DEMO_BANNER_KEY);
      setShowDemoBanner(!dismissed);
    } else {
      setShowDemoBanner(false);
    }
  }, [isDemo]);

  const dismissBanner = () => {
    localStorage.setItem(DEMO_BANNER_KEY, 'true');
    setShowDemoBanner(false);
  };

  if (loading) {
    return (
      <>
        <Header title="Dashboard" description="Overview of your workflow execution logs" />
        <DashboardSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Dashboard" description="Overview of your workflow execution logs" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">Error loading metrics: {error.message}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Dashboard" 
        description="Overview of your workflow execution logs"
      />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {/* Demo Banner */}
        {showDemoBanner && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  You're viewing sample data
                </p>
                <p className="text-xs text-blue-700">
                  Connect your workflow to see real logs and metrics
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Logs"
            value={totalLogsCount.toLocaleString()}
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
            value={(displayMetrics?.error_count ?? 0).toLocaleString()}
            icon={XCircle}
          />

          <MetricCard
            title="Avg Execution Time"
            value={`${(displayMetrics?.avg_execution_time ?? 0).toFixed(2)}s`}
            icon={Clock}
          />
        </div>

        {/* Time Series Chart */}
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

          {(displayMetrics?.time_series?.length ?? 0) > 0 ? (
            <TimeSeriesChart data={displayMetrics!.time_series!} />
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
    </>
  );
}

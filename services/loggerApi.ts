/**
 * Logger API Service
 * All backend communication happens through this service
 */
import axios, { AxiosInstance } from 'axios';
import {
  WorkflowLog,
  LogDetail,
  LogsListResponse,
  MetricsOverview,
  CategoryMetrics,
  LogQueryParams,
} from '@/types/logs';

class LoggerAPI {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'X-API-Key': apiKey }),
      },
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * Get analytics overview metrics
   */
  async getMetricsOverview(): Promise<MetricsOverview> {
    const response = await this.client.get('/api/v1/metrics/overview');
    return response.data;
  }

  /**
   * Get category breakdown metrics
   */
  async getCategoryMetrics(): Promise<CategoryMetrics[]> {
    const response = await this.client.get('/api/v1/metrics/categories');
    return response.data;
  }

  /**
   * Get logs list with filtering and pagination
   */
  async getLogs(params: LogQueryParams = {}): Promise<LogsListResponse> {
    const response = await this.client.get('/api/v1/logs', { params });
    return response.data;
  }

  /**
   * Get single log detail by ID
   */
  async getLogById(id: string): Promise<LogDetail> {
    const response = await this.client.get(`/api/v1/logs/${id}`);
    return response.data;
  }
}

// Export singleton instance
export const loggerApi = new LoggerAPI();

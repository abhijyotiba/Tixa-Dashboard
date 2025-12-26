/**
 * Logger API Service
 * All backend communication happens through this service
 */
import axios, { AxiosInstance } from 'axios';
import {
  LogDetail,
  LogsListResponse,
  MetricsOverview,
  CategoryMetrics,
  LogQueryParams,
} from '@/types/logs';

class LoggerAPI {
  private client: AxiosInstance;

  constructor() {
    // SECURITY FIX: We point to our own Next.js API (proxy) to hide the real API Key
    // See the next.config.js fix below.
    const baseURL = '/api/proxy'; 

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
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
    const response = await this.client.get('/metrics/overview');
    // Backend returns: { data: { ...metrics }, client_id: "..." }
    // Frontend expects: { ...metrics }
    return response.data.data;
  }

  /**
   * Get category breakdown metrics
   */
  async getCategoryMetrics(): Promise<CategoryMetrics[]> {
    const response = await this.client.get('/metrics/categories');
    // Backend returns: { data: [ ...categories ], period_days: 7 }
    // Frontend expects: [ ...categories ]
    return response.data.data;
  }

  /**
   * Get logs list with filtering and pagination
   */
  async getLogs(params: LogQueryParams = {}): Promise<LogsListResponse> {
    const response = await this.client.get('/logs', { params });
    
    // Backend returns: { data: [...], pagination: { page, total, ... }, filters: {...} }
    // Frontend expects: { items: [...], page, total, ... }
    
    const { data, pagination } = response.data;
    
    return {
      items: data,
      page: pagination.page,
      page_size: pagination.page_size,
      total: pagination.total,
      pages: pagination.pages
    };
  }

  /**
   * Get single log detail by ID
   */
  async getLogById(id: string): Promise<LogDetail> {
    const response = await this.client.get(`/logs/${id}`);
    
    // Backend returns: { data: { ...log_fields, payload: {...} } }
    // Frontend expects: { ...log_fields, trace: {...} }
    
    const logData = response.data.data;
    
    return {
      ...logData,
      // Map the backend 'payload' field to the frontend 'trace' field
      trace: logData.payload || {}, 
    };
  }
}

// Export singleton instance
export const loggerApi = new LoggerAPI();

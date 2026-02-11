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
import {
  Comment,
  CommentsResponse,
  CreateCommentData,
  CreateReplyData,
  UpdateCommentData,
  CreateCommentResponse,
  DeleteCommentResponse,
  CommentsListResponse,
  CommentsQueryParams,
} from '@/types/comments';

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
   * @param period - Number of days to fetch metrics for (1, 7, 30)
   */
  async getMetricsOverview(period: number = 7): Promise<MetricsOverview> {
    const response = await this.client.get('/metrics/overview', {
      params: { period_days: period }
    });
    // Backend returns: { data: { ...metrics }, client_id: "..." }
    // Frontend expects: { ...metrics }
    const data = response.data.data;
    
    // Handle different possible time_series field names from backend
    const timeSeries = data.time_series || data.timeSeries || data.daily_counts || data.dailyCounts || [];
    
    return {
      ...data,
      time_series: timeSeries
    };
  }

  /**
   * Get time series data for tickets processed
   * @param period - Number of days to fetch (1, 7, 30)
   */
  async getTimeSeries(period: number = 7): Promise<{ date: string; count: number }[]> {
    try {
      // Try dedicated time series endpoint first
      const response = await this.client.get('/metrics/time-series', {
        params: { period_days: period }
      });
      return response.data.data || response.data || [];
    } catch {
      // Fallback: fetch recent logs and aggregate by date
      // Backend max page_size is 100, so we fetch multiple pages if needed
      try {
        const dateMap = new Map<string, number>();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);
        
        // Fetch up to 5 pages (500 logs total)
        let page = 1;
        let hasMore = true;
        
        while (hasMore && page <= 5) {
          const logsResponse = await this.getLogs({ page, page_size: 100 });
          const logs = logsResponse.items;
          
          logs.forEach(log => {
            const logDate = new Date(log.executed_at || log.created_at);
            if (logDate >= cutoffDate) {
              const dateKey = logDate.toISOString().split('T')[0];
              dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
            }
          });
          
          // Check if there are more pages
          hasMore = page < logsResponse.pages;
          page++;
        }
        
        // Convert to array and sort by date
        const result = Array.from(dateMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        return result;
      } catch {
        return [];
      }
    }
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

  // ==================== COMMENTS API ====================

  /**
   * Get all comments for a specific log
   */
  async getCommentsForLog(logId: string): Promise<CommentsResponse> {
    const response = await this.client.get(`/logs/${logId}/comments`);
    return response.data;
  }

  /**
   * Create a new comment on a log
   */
  async createComment(logId: string, data: CreateCommentData): Promise<CreateCommentResponse> {
    const response = await this.client.post(`/logs/${logId}/comments`, data);
    return response.data;
  }

  /**
   * Create a reply to an existing comment
   */
  async createReply(commentId: string, data: CreateReplyData): Promise<CreateCommentResponse> {
    const response = await this.client.post(`/comments/${commentId}/replies`, data);
    return response.data;
  }

  /**
   * Get a single comment with its replies
   */
  async getComment(commentId: string): Promise<{ data: Comment }> {
    const response = await this.client.get(`/comments/${commentId}`);
    return response.data;
  }

  /**
   * Update a comment's text and/or status
   */
  async updateComment(commentId: string, data: UpdateCommentData): Promise<CreateCommentResponse> {
    const response = await this.client.put(`/comments/${commentId}`, data);
    return response.data;
  }

  /**
   * Delete a comment and all its replies
   */
  async deleteComment(commentId: string): Promise<DeleteCommentResponse> {
    const response = await this.client.delete(`/comments/${commentId}`);
    return response.data;
  }

  /**
   * Get all comments with optional filters (for dashboard)
   */
  async getAllComments(params: CommentsQueryParams = {}): Promise<CommentsListResponse> {
    const response = await this.client.get('/comments', { params });
    return response.data;
  }
}

// Export singleton instance
export const loggerApi = new LoggerAPI();

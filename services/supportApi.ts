/**
 * Support API Service
 * Handles all support ticket operations
 */
import axios, { AxiosInstance } from 'axios';
import {
  SupportTicket,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketsListResponse,
  TicketsQueryParams,
} from '@/types/support';

class SupportAPI {
  private client: AxiosInstance;

  constructor() {
    // Use Next.js proxy to add JWT authentication
    const baseURL = '/api/proxy';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new support ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<SupportTicket> {
    const response = await this.client.post('/support/tickets', data);
    return response.data.data;
  }

  /**
   * List user's tickets with pagination and filtering
   */
  async listTickets(params?: TicketsQueryParams): Promise<TicketsListResponse> {
    const response = await this.client.get('/support/tickets', { params });
    return response.data.data;
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicket(id: string): Promise<SupportTicket> {
    const response = await this.client.get(`/support/tickets/${id}`);
    return response.data.data;
  }

  /**
   * Update a ticket (add additional info or close)
   */
  async updateTicket(id: string, data: UpdateTicketRequest): Promise<SupportTicket> {
    const response = await this.client.patch(`/support/tickets/${id}`, data);
    return response.data.data;
  }
}

// Export singleton instance
export const supportApi = new SupportAPI();

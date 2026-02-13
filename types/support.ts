export type TicketCategory = 'bug' | 'feature_request' | 'question' | 'account_issue';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  admin_reply: string | null;
  admin_replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

export interface UpdateTicketRequest {
  additional_info?: string;
  status?: 'closed';
}

export interface TicketsListResponse {
  items: SupportTicket[];
  total: number;
  page: number;
  page_size: number;
}

export interface TicketsQueryParams {
  page?: number;
  page_size?: number;
  status?: TicketStatus;
}

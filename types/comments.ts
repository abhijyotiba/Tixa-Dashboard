// Type definitions for the log comments feature

export type UserType = 'client' | 'internal';
export type CommentStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface Comment {
  id: string;
  log_id: string;
  parent_id: string | null;
  user_id: string;
  user_name: string | null;
  user_type: UserType;
  comment_text: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface CreateCommentData {
  user_id: string;
  user_name?: string;
  user_type: UserType;
  comment_text: string;
  status?: CommentStatus;
}

export interface CreateReplyData {
  user_id: string;
  user_name?: string;
  user_type: UserType;
  comment_text: string;
}

export interface UpdateCommentData {
  comment_text?: string;
  status?: CommentStatus;
}

export interface CommentsResponse {
  data: Comment[];
  count: number;
}

export interface SingleCommentResponse {
  data: Comment;
}

export interface CreateCommentResponse {
  message: string;
  data: Comment;
}

export interface DeleteCommentResponse {
  message: string;
  deleted_id: string;
}

export interface CommentsListResponse {
  data: Comment[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    pages: number;
  };
  filters: {
    status: CommentStatus | null;
    user_type: UserType | null;
  };
}

export interface CommentsQueryParams {
  status?: CommentStatus;
  user_type?: UserType;
  page?: number;
  page_size?: number;
}

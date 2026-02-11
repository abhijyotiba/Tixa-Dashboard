'use client';

import { useState, useEffect, useCallback } from 'react';
import { loggerApi } from '@/services/loggerApi';
import {
  Comment,
  CreateCommentData,
  CreateReplyData,
  UpdateCommentData,
} from '@/types/comments';

export function useComments(logId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!logId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await loggerApi.getCommentsForLog(logId);
      setComments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to fetch comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [logId]);

  const addComment = async (data: CreateCommentData): Promise<boolean> => {
    if (!logId) return false;

    try {
      await loggerApi.createComment(logId, data);
      await fetchComments(); // Refresh list
      return true;
    } catch (err) {
      console.error('Failed to create comment:', err);
      setError('Failed to create comment');
      return false;
    }
  };

  const addReply = async (parentId: string, data: CreateReplyData): Promise<boolean> => {
    try {
      await loggerApi.createReply(parentId, data);
      await fetchComments(); // Refresh list
      return true;
    } catch (err) {
      console.error('Failed to create reply:', err);
      setError('Failed to create reply');
      return false;
    }
  };

  const updateComment = async (commentId: string, data: UpdateCommentData): Promise<boolean> => {
    try {
      await loggerApi.updateComment(commentId, data);
      await fetchComments(); // Refresh list
      return true;
    } catch (err) {
      console.error('Failed to update comment:', err);
      setError('Failed to update comment');
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      await loggerApi.deleteComment(commentId);
      await fetchComments(); // Refresh list
      return true;
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
      return false;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    addReply,
    updateComment,
    deleteComment,
    refresh: fetchComments,
  };
}

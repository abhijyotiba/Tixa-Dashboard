'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { loggerApi } from '@/services/loggerApi';
import {
  Comment,
  CreateCommentData,
  CreateReplyData,
  UpdateCommentData,
} from '@/types/comments';

export function useComments(logId: string | null) {
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    // Only fetch if logId exists
    logId ? ['comments', logId] : null,
    async () => {
      const response = await loggerApi.getCommentsForLog(logId!);
      return response.data || [];
    },
    {
      // Comments can be stale for a bit
      dedupingInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  const addComment = async (commentData: CreateCommentData): Promise<boolean> => {
    if (!logId) return false;
    setMutationError(null);

    try {
      await loggerApi.createComment(logId, commentData);
      // Revalidate the comments list
      await mutate();
      return true;
    } catch (err) {
      console.error('Failed to create comment:', err);
      setMutationError('Failed to create comment');
      return false;
    }
  };

  const addReply = async (parentId: string, replyData: CreateReplyData): Promise<boolean> => {
    setMutationError(null);

    try {
      await loggerApi.createReply(parentId, replyData);
      await mutate();
      return true;
    } catch (err) {
      console.error('Failed to create reply:', err);
      setMutationError('Failed to create reply');
      return false;
    }
  };

  const updateComment = async (commentId: string, updateData: UpdateCommentData): Promise<boolean> => {
    setMutationError(null);

    try {
      await loggerApi.updateComment(commentId, updateData);
      await mutate();
      return true;
    } catch (err) {
      console.error('Failed to update comment:', err);
      setMutationError('Failed to update comment');
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    setMutationError(null);

    try {
      await loggerApi.deleteComment(commentId);
      await mutate();
      return true;
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setMutationError('Failed to delete comment');
      return false;
    }
  };

  return {
    comments: data ?? [],
    loading: isLoading,
    error: error?.message || mutationError,
    addComment,
    addReply,
    updateComment,
    deleteComment,
    refresh: mutate,
  };
}

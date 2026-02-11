'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { UserType } from '@/types/comments';
import CommentCard from './CommentCard';
import AddCommentForm from './AddCommentForm';
import { createClient } from '@/utils/supabase/client';

interface CommentsSectionProps {
  logId: string;
}

export default function CommentsSection({ logId }: CommentsSectionProps) {
  const { comments, loading, error, addComment, addReply, updateComment, deleteComment, refresh } = useComments(logId);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; type: UserType } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch current user info from Supabase
  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Dashboard users are internal by default (can manage comment status)
          const userType: UserType = user.user_metadata?.user_type || 'internal';
          
          setCurrentUser({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            type: userType,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setUserLoading(false);
      }
    }

    fetchUser();
  }, []);

  const commentCount = comments.length;
  const totalReplies = comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0);
  const totalCount = commentCount + totalReplies;

  if (userLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center text-gray-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          Please log in to view and add comments.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <span className="text-lg font-semibold text-gray-900">Comments</span>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refresh();
            }}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh comments"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Add Comment Form */}
          <AddCommentForm
            currentUser={currentUser}
            onSubmit={addComment}
          />

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && comments.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Loading comments...
            </div>
          )}

          {/* Empty State */}
          {!loading && comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No comments yet. Be the first to add one!</p>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  onUpdate={updateComment}
                  onDelete={deleteComment}
                  onReply={addReply}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

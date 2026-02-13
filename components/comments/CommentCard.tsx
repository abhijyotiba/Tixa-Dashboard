'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { User, UserCog, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Comment, CommentStatus, UpdateCommentData, CreateReplyData } from '@/types/comments';
import StatusDropdown from './StatusDropdown';

interface CommentCardProps {
  comment: Comment;
  currentUser: { id: string; name: string; type: 'client' | 'internal' };
  onUpdate: (commentId: string, data: UpdateCommentData) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  onReply: (parentId: string, data: CreateReplyData) => Promise<boolean>;
  isReply?: boolean;
}

const statusColors: Record<CommentStatus, string> = {
  open: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  pending: 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  closed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

export default function CommentCard({
  comment,
  currentUser,
  onUpdate,
  onDelete,
  onReply,
  isReply = false,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = comment.user_id === currentUser.id;
  const canModifyStatus = currentUser.type === 'internal' && !comment.parent_id;
  const isEdited = comment.updated_at !== comment.created_at;

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    
    setIsSaving(true);
    const success = await onUpdate(comment.id, { comment_text: editText });
    setIsSaving(false);
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(comment.comment_text);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setIsDeleting(true);
    await onDelete(comment.id);
    setIsDeleting(false);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    
    setIsSaving(true);
    const success = await onReply(comment.id, {
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_type: currentUser.type,
      comment_text: replyText,
    });
    setIsSaving(false);
    
    if (success) {
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: CommentStatus) => {
    await onUpdate(comment.id, { status: newStatus });
  };

  return (
    <div className={`${isReply ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-800 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={comment.user_type === 'internal' ? 'text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
              {comment.user_type === 'internal' ? (
                <UserCog className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.user_name || comment.user_id}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              ({comment.user_type})
            </span>
          </div>
          
          {/* Status badge (only for top-level comments) */}
          {!comment.parent_id && (
            canModifyStatus ? (
              <StatusDropdown
                currentStatus={comment.status}
                onChange={handleStatusChange}
              />
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[comment.status]}`}>
                {comment.status}
              </span>
            )
          )}
        </div>

        {/* Comment content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editText.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 whitespace-pre-wrap">{comment.comment_text}</p>
        )}

        {/* Footer: timestamp and actions */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>{format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}</span>
            {isEdited && <span className="italic">(edited)</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* Reply button (only for top-level comments) */}
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <MessageSquare className="h-3 w-3" />
                Reply
              </button>
            )}

            {/* Edit button (only for owner) */}
            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}

            {/* Delete button (only for owner or internal users) */}
            {(isOwner || currentUser.type === 'internal') && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmitReply}
                disabled={isSaving || !replyText.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setReplyText('');
                  setIsReplying(false);
                }}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

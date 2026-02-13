'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { CreateCommentData, UserType } from '@/types/comments';

interface AddCommentFormProps {
  currentUser: { id: string; name: string; type: UserType };
  onSubmit: (data: CreateCommentData) => Promise<boolean>;
}

export default function AddCommentForm({ currentUser, onSubmit }: AddCommentFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    setLoading(true);
    
    const success = await onSubmit({
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_type: currentUser.type,
      comment_text: text.trim(),
      status: 'open',
    });
    
    setLoading(false);
    
    if (success) {
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment about this log... (e.g., report an issue, ask a question, or provide feedback)"
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={3}
        disabled={loading}
      />
      
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Posting as <span className="font-medium">{currentUser.name}</span>
          <span className="ml-1 capitalize">({currentUser.type})</span>
        </div>
        
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}

'use client';

import { SupportTicket, TicketStatus } from '@/types/support';
import { useState } from 'react';
import { supportApi } from '@/services/supportApi';
import { CheckCircle2, Clock, AlertCircle, XCircle, ChevronRight } from 'lucide-react';

interface TicketCardProps {
  ticket: SupportTicket;
  onUpdate?: () => void;
}

export function TicketCard({ ticket, onUpdate }: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return;

    setIsClosing(true);
    try {
      await supportApi.updateTicket(ticket.id, { status: 'closed' });
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to close ticket');
    } finally {
      setIsClosing(false);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-gray-200';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'resolved':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'closed':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-3 h-3" />;
      case 'in_progress':
        return <Clock className="w-3 h-3" />;
      case 'resolved':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'closed':
        return <XCircle className="w-3 h-3" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md hover:border-blue-300 dark:hover:border-blue-600 transition">
      {/* Card Header */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">#{ticket.id.slice(0, 8)}</span>
            </div>
            
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
              {ticket.subject}
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{getCategoryLabel(ticket.category)}</span>
              <span>·</span>
              <span className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </span>
              <span>·</span>
              <span>{formatDate(ticket.created_at)}</span>
            </div>
          </div>

          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800">
          <div className="pt-3 space-y-3">
            {/* Description */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Admin Reply */}
            {ticket.admin_reply && (
              <div className="bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Tixa Support</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ticket.admin_replied_at && formatDate(ticket.admin_replied_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.admin_reply}</p>
              </div>
            )}

            {/* Actions */}
            {ticket.status !== 'closed' && (
              <div className="pt-1">
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                >
                  {isClosing ? 'Closing...' : 'Close Ticket'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

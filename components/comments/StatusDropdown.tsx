'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CommentStatus } from '@/types/comments';

interface StatusDropdownProps {
  currentStatus: CommentStatus;
  onChange: (status: CommentStatus) => Promise<void>;
  disabled?: boolean;
}

const statuses: CommentStatus[] = ['open', 'pending', 'resolved', 'closed'];

const statusConfig: Record<CommentStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: 'text-yellow-800', bgColor: 'bg-yellow-100 hover:bg-yellow-200' },
  pending: { label: 'Pending', color: 'text-blue-800', bgColor: 'bg-blue-100 hover:bg-blue-200' },
  resolved: { label: 'Resolved', color: 'text-green-800', bgColor: 'bg-green-100 hover:bg-green-200' },
  closed: { label: 'Closed', color: 'text-gray-800', bgColor: 'bg-gray-100 hover:bg-gray-200' },
};

export default function StatusDropdown({ currentStatus, onChange, disabled = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (status: CommentStatus) => {
    if (status === currentStatus) {
      setIsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    setIsOpen(false);
    await onChange(status);
    setIsUpdating(false);
  };

  const current = statusConfig[currentStatus];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${current.bgColor} ${current.color} disabled:opacity-50`}
      >
        {isUpdating ? 'Updating...' : current.label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[120px]">
            {statuses.map((status) => {
              const config = statusConfig[status];
              const isSelected = status === currentStatus;
              
              return (
                <button
                  key={status}
                  onClick={() => handleSelect(status)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between ${
                    isSelected ? 'font-medium' : ''
                  }`}
                >
                  <span className={config.color}>{config.label}</span>
                  {isSelected && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

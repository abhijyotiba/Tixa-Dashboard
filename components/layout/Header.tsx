'use client';

import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
          </button>

          {/* User */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              PL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

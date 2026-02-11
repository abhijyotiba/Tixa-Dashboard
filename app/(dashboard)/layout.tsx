'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}

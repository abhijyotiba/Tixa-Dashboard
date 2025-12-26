'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Settings" 
          description="Manage your logger configuration"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Settings (Coming Soon)
              </h3>
              <p className="text-sm text-gray-600">
                Configuration and preferences will be available here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

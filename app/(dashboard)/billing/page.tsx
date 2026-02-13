'use client';

import Header from '@/components/layout/Header';

export default function BillingPage() {
  return (
    <>
      <Header 
        title="Billing" 
        description="Manage your subscription and usage"
      />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Billing (Coming Soon)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Subscription management and invoices will be available here.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

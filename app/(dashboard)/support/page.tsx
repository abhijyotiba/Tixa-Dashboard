'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import NewTicketForm from '@/components/support/NewTicketForm';
import TicketsList from '@/components/support/TicketsList';
import { Plus, ListTodo, HelpCircle } from 'lucide-react';

type Tab = 'new' | 'tickets' | 'faq';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<Tab>('new');

  return (
    <>
      <Header title="Support" description="Get help from the Tixa team" />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'tickets'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'faq'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            {activeTab === 'new' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Create a Support Ticket</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submit your issue and we'll get back to you within 24 hours.
                  </p>
                </div>
                <NewTicketForm onSuccess={() => setActiveTab('tickets')} />
              </div>
            )}

            {activeTab === 'tickets' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">My Support Tickets</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Track the status of your submitted tickets.
                  </p>
                </div>
                <TicketsList />
              </div>
            )}

            {activeTab === 'faq' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Frequently Asked Questions</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quick answers to common questions.
                  </p>
                </div>

                <div className="space-y-3">
                  <details className="group border border-gray-200 dark:border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition list-none flex items-center justify-between">
                      <span>How do I generate an API key?</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                      Go to Settings → API Keys and click "Generate New Key". Store it securely.
                    </div>
                  </details>

                  <details className="group border border-gray-200 dark:border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition list-none flex items-center justify-between">
                      <span>What are the rate limits for the API?</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                      Free: 1,000/day. Pro: 10,000/day. Enterprise: Custom limits.
                    </div>
                  </details>

                  <details className="group border border-gray-200 dark:border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition list-none flex items-center justify-between">
                      <span>How long is my data retained?</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                      Free: 7 days. Pro: 30 days. Enterprise: 90 days or custom.
                    </div>
                  </details>

                  <details className="group border border-gray-200 dark:border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition list-none flex items-center justify-between">
                      <span>How do I upgrade my plan?</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                      Go to Billing → Upgrade Plan. Changes take effect immediately.
                    </div>
                  </details>

                  <details className="group border border-gray-200 dark:border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition list-none flex items-center justify-between">
                      <span>What payment methods do you accept?</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                    </summary>
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                      Visa, MasterCard, American Express, PayPal. Enterprise: bank transfer.
                    </div>
                  </details>
                </div>

                {/* Still need help? */}
                <div className="mt-6 bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Can't find what you're looking for?</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                  >
                    Create Ticket
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}

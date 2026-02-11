'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { getAgentConsoleUrl } from '@/services/userSettings';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Settings, MessageSquareOff, ExternalLink } from 'lucide-react';

export default function ChatPage() {
  const [agentConsoleUrl, setAgentConsoleUrl] = useState<string | null>(null);
  const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    async function fetchUrlAndToken() {
      try {
        const supabase = createClient();
        
        const { data: { session } } = await supabase.auth.getSession();
        
        const url = await getAgentConsoleUrl();
        setAgentConsoleUrl(url);
        
        if (url && session?.access_token) {
          const urlObj = new URL(url);
          urlObj.searchParams.set('token', session.access_token);
          setAuthenticatedUrl(urlObj.toString());
        } else {
          setAuthenticatedUrl(url);
        }
      } catch (error) {
        console.error('Failed to fetch agent console URL:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUrlAndToken();
  }, []);

  if (loading) {
    return (
      <>
        <Header 
          title="Chat" 
          description="Flusso Automation Assistant"
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={32} />
            <span>Loading chat...</span>
          </div>
        </main>
      </>
    );
  }

  if (!agentConsoleUrl) {
    return (
      <>
        <Header 
          title="Chat" 
          description="Flusso Automation Assistant"
        />
        <main className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <MessageSquareOff className="text-purple-600" size={32} />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Agent Console Not Configured
            </h2>
            
            <p className="text-gray-600 mb-6">
              To use the chat feature, you need to configure your Agent Console URL in the settings page.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/settings"
                className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <Settings className="mr-2" size={18} />
                Configure in Settings
              </Link>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">or</span>
                </div>
              </div>
              
              <a
                href="mailto:support@tixa.io?subject=Agent Console URL Setup"
                className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Contact Tixa Support
              </a>
            </div>
            
            <p className="mt-6 text-xs text-gray-500">
              Don't have an Agent Console? Contact our team to get started with Flusso Automation.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Chat" 
        description="Flusso Automation Assistant"
      />

      <main className="flex-1 overflow-hidden relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={32} />
              <span>Loading Agent Console...</span>
            </div>
          </div>
        )}
        
        <iframe 
          src={authenticatedUrl || agentConsoleUrl || ''}
          className="w-full h-full border-0"
          allow="microphone; camera"
          title="Flusso Agent Console"
          onLoad={() => setIframeLoading(false)}
        />
        
        <a
          href={agentConsoleUrl || ''}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors z-20"
        >
          <ExternalLink className="mr-1.5" size={14} />
          Open in new tab
        </a>
      </main>
    </>
  );
}

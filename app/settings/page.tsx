'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Plus, Trash2, Copy, Check, Key, AlertCircle, Monitor, Loader2, ExternalLink } from 'lucide-react';
import { getAgentConsoleUrl, setAgentConsoleUrl } from '@/services/userSettings';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Agent Console URL state
  const [agentConsoleUrl, setAgentConsoleUrlState] = useState('');
  const [agentConsoleLoading, setAgentConsoleLoading] = useState(true);
  const [agentConsoleSaving, setAgentConsoleSaving] = useState(false);
  const [agentConsoleSuccess, setAgentConsoleSuccess] = useState(false);
  const [agentConsoleError, setAgentConsoleError] = useState<string | null>(null);

  // 1. Fetch Keys on Load
  useEffect(() => {
    fetchKeys();
    fetchAgentConsoleUrl();
  }, []);

  // Fetch Agent Console URL
  async function fetchAgentConsoleUrl() {
    try {
      setAgentConsoleLoading(true);
      const url = await getAgentConsoleUrl();
      setAgentConsoleUrlState(url || '');
    } catch (err) {
      console.error('Failed to fetch agent console URL:', err);
    } finally {
      setAgentConsoleLoading(false);
    }
  }

  // Save Agent Console URL
  async function handleSaveAgentConsoleUrl(e: React.FormEvent) {
    e.preventDefault();
    setAgentConsoleSaving(true);
    setAgentConsoleError(null);
    setAgentConsoleSuccess(false);

    try {
      const result = await setAgentConsoleUrl(agentConsoleUrl.trim());
      if (result.success) {
        setAgentConsoleSuccess(true);
        setTimeout(() => setAgentConsoleSuccess(false), 3000);
      } else {
        setAgentConsoleError(result.error || 'Failed to save URL');
      }
    } catch (err) {
      console.error('Failed to save agent console URL:', err);
      setAgentConsoleError('Failed to save URL');
    } finally {
      setAgentConsoleSaving(false);
    }
  }

  async function fetchKeys() {
    try {
      setError(null);
      const res = await fetch('/api/proxy/auth/keys');
      if (res.ok) {
        const data = await res.json();
        // Backend might return { data: [...] } or just [...]
        const keysArray = Array.isArray(data) ? data : (data.data || data.keys || []);
        setKeys(keysArray);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to fetch API keys');
      }
    } catch (error) {
      console.error('Failed to fetch keys', error);
      setError('Network error: Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  }

  // 2. Generate New Key
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      setError(null);
      const res = await fetch('/api/proxy/auth/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.api_key); // Backend returns the raw key ONLY once
        setKeyName('');
        fetchKeys();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Failed to create key', error);
      setError('Network error: Unable to create API key');
    }
  }

  // 3. Revoke Key
  async function handleRevoke(id: string) {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    
    try {
      setError(null);
      const res = await fetch(`/api/proxy/auth/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKeys();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to revoke API key');
      }
    } catch (error) {
      console.error('Failed to revoke key', error);
      setError('Network error: Unable to revoke API key');
    }
  }

  // 4. Copy to Clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" description="Manage your API keys for Python SDK integration" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Agent Console URL Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Monitor className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Agent Console</h2>
                  <p className="text-sm text-gray-600">Configure your Flusso Agent Console URL to access the chatbot</p>
                </div>
              </div>
              
              {agentConsoleLoading ? (
                <div className="flex items-center gap-2 text-gray-500 py-4">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-sm">Loading settings...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveAgentConsoleUrl} className="space-y-4">
                  <div>
                    <label htmlFor="agentConsoleUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Agent Console URL
                    </label>
                    <input
                      id="agentConsoleUrl"
                      type="url"
                      placeholder="https://your-agent-console.run.app"
                      value={agentConsoleUrl}
                      onChange={(e) => setAgentConsoleUrlState(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2.5 border"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the URL of your Flusso Agent Console deployed on Google Cloud Run
                    </p>
                  </div>
                  
                  {agentConsoleError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {agentConsoleError}
                    </div>
                  )}
                  
                  {agentConsoleSuccess && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <Check size={16} />
                      Agent Console URL saved successfully!
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={agentConsoleSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {agentConsoleSaving ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Saving...
                        </>
                      ) : (
                        'Save URL'
                      )}
                    </button>
                    
                    {agentConsoleUrl && (
                      <a
                        href="/chat"
                        className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <ExternalLink className="mr-2" size={16} />
                        Open Chat
                      </a>
                    )}
                  </div>
                </form>
              )}
              
              {!agentConsoleLoading && !agentConsoleUrl && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Need help?</strong> Contact Tixa Support to get your Agent Console URL configured.
                  </p>
                </div>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-red-900 font-semibold text-sm">Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* New Key Success Alert */}
            {newKey && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Key size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-900 font-semibold">API Key Generated</h3>
                    <p className="text-green-700 text-sm mt-1 mb-3">
                      ⚠️ Copy this key now. You won't be able to see it again!
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white border border-green-200 px-3 py-2 rounded text-sm font-mono text-gray-800 break-all select-all">
                        {newKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newKey)}
                        className="p-2 text-green-700 hover:bg-green-100 rounded transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
                      <AlertCircle className="text-yellow-600 flex-shrink-0" size={16} />
                      <p className="text-xs text-yellow-800">
                        This key will never be shown again. Save it securely before closing.
                      </p>
                    </div>
                    <button
                      onClick={() => setNewKey(null)}
                      className="mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                    >
                      I've saved this key
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Key Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New API Key</h2>
              <p className="text-sm text-gray-600 mb-4">
                Generate a new API key to authenticate your Python SDK or logging agents. 
                Use it with the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">X-API-Key</code> header.
              </p>
              <form onSubmit={handleGenerate} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Key Name (e.g., Production Server, Dev Environment)"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  required
                />
                <button
                  type="submit"
                  disabled={!keyName.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Key
                </button>
              </form>
            </div>

            {/* Keys List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Your API Keys</h2>
              </div>
              
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  Loading keys...
                </div>
              ) : keys.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Key className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm">
                    No active keys found. Create one above to get started.
                  </p>
                </div>
              ) : !Array.isArray(keys) ? (
                <div className="px-6 py-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-3" />
                  <p className="text-red-500 text-sm">
                    Invalid data format received from server
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {keys.map((key) => (
                    <li key={key.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{key.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {key.prefix}••••••••
                          </span>
                          <span className="text-xs text-gray-400">
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </span>
                          {key.last_used_at && (
                            <span className="text-xs text-gray-400">
                              Last used {new Date(key.last_used_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          key.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {key.is_active ? 'Active' : 'Revoked'}
                        </span>
                        {key.is_active && (
                          <button 
                            onClick={() => handleRevoke(key.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Revoke Key"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-900 font-semibold mb-2 flex items-center gap-2">
                <Key size={18} />
                How to Use Your API Key
              </h3>
              <div className="text-blue-800 text-sm space-y-2">
                <p>Include your API key in the <code className="bg-blue-100 px-1.5 py-0.5 rounded">X-API-Key</code> header when making requests:</p>
                <pre className="bg-blue-900 text-blue-100 p-3 rounded text-xs overflow-x-auto mt-2">
{`# Python Example
import requests

headers = {
    "X-API-Key": "your-api-key-here"
}

response = requests.post(
    "https://your-backend.com/api/v1/logs",
    json={"message": "Hello, World!"},
    headers=headers
)`}
                </pre>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Plus, Trash2, Copy, Check, Key, AlertCircle, Monitor, Loader2, ExternalLink, Shield, Zap, Activity } from 'lucide-react';
import { getAgentConsoleUrl, setAgentConsoleUrl } from '@/services/userSettings';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

type TabType = 'general' | 'api-keys' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [agentConsoleUrl, setAgentConsoleUrlState] = useState('');
  const [agentConsoleLoading, setAgentConsoleLoading] = useState(true);
  const [agentConsoleSaving, setAgentConsoleSaving] = useState(false);
  const [agentConsoleSuccess, setAgentConsoleSuccess] = useState(false);
  const [agentConsoleError, setAgentConsoleError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
    fetchAgentConsoleUrl();
  }, []);

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
        setNewKey(data.api_key);
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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Header title="Admin Settings" description="Manage your account settings and API integrations" />

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-6">
            <nav className="flex space-x-1" aria-label="Tabs">
              {[
                { id: 'general' as TabType, name: 'General Settings', icon: Shield },
                { id: 'api-keys' as TabType, name: 'API Keys', icon: Key },
                { id: 'security' as TabType, name: 'Agent Console', icon: Monitor },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Error Alert - Global */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 dark:bg-red-800/50 rounded-full">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 dark:text-red-300 font-semibold text-sm">Error</h3>
                  <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Agent Console Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Agent Console URL Section */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
                      <Monitor className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Console</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Configure your Flusso Agent Console URL</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {agentConsoleLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-4">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="text-sm">Loading settings...</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAgentConsoleUrl} className="space-y-4">
                      <div>
                        <label htmlFor="agentConsoleUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Agent Console URL
                        </label>
                        <input
                          id="agentConsoleUrl"
                          type="url"
                          placeholder="https://your-agent-console.run.app"
                          value={agentConsoleUrl}
                          onChange={(e) => setAgentConsoleUrlState(e.target.value)}
                          className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3 border transition-colors"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Enter the URL of your Flusso Agent Console deployed on Google Cloud Run
                        </p>
                      </div>
                      
                      {agentConsoleError && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          <AlertCircle size={16} />
                          {agentConsoleError}
                        </div>
                      )}
                      
                      {agentConsoleSuccess && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <Check size={16} />
                          Agent Console URL saved successfully!
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={agentConsoleSaving}
                          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                        >
                          {agentConsoleSaving ? (
                            <>
                              <Loader2 className="animate-spin mr-2" size={16} />
                              Saving...
                            </>
                          ) : (
                            'Save Settings'
                          )}
                        </button>
                        
                        {agentConsoleUrl && (
                          <a
                            href="/chat"
                            className="inline-flex items-center px-5 py-2.5 border border-purple-200 dark:border-purple-700 text-sm font-medium rounded-lg text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                          >
                            <ExternalLink className="mr-2" size={16} />
                            Open Chat
                          </a>
                        )}
                      </div>
                    </form>
                  )}
                  
                  {!agentConsoleLoading && !agentConsoleUrl && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                      <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        <strong>Need help?</strong> Contact Tixa Support to get your Agent Console URL configured.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              {/* New Key Success Alert */}
              {newKey && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                      <Key size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-green-900 dark:text-green-300 font-semibold text-lg">API Key Generated!</h3>
                      <p className="text-green-700 dark:text-green-400 text-sm mt-1 mb-4">
                        ⚠️ Copy this key now. You won't be able to see it again!
                      </p>
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-700 rounded-lg p-1">
                        <code className="flex-1 px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 break-all select-all bg-transparent">
                          {newKey}
                        </code>
                        <button
                          onClick={() => copyToClipboard(newKey)}
                          className="p-2.5 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50 rounded-lg transition-colors flex-shrink-0"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                      <button
                        onClick={() => setNewKey(null)}
                        className="mt-4 text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium underline underline-offset-2"
                      >
                        I've saved this key
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Key Form */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
                      <Plus className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New API Key</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Generate keys for your Python SDK or logging agents</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <form onSubmit={handleGenerate} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Key Name (e.g., Production Server, Dev Environment)"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={!keyName.trim()}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Key
                    </button>
                  </form>
                </div>
              </div>

              {/* Keys List */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Key className="text-gray-600 dark:text-gray-400" size={18} />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Your API Keys</h2>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {keys.length} key{keys.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading keys...</p>
                  </div>
                ) : keys.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      <Key className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">No API keys yet</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Create your first API key to get started
                    </p>
                  </div>
                ) : !Array.isArray(keys) ? (
                  <div className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-3" />
                    <p className="text-red-500 dark:text-red-400 text-sm">
                      Invalid data format received
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {keys.map((key) => (
                      <li key={key.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{key.name}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                              key.is_active 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${key.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                              {key.is_active ? 'Active' : 'Revoked'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {key.prefix}••••••••
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Created {new Date(key.created_at).toLocaleDateString()}
                            </span>
                            {key.last_used_at && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                Last used {new Date(key.last_used_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {key.is_active && (
                          <button 
                            onClick={() => handleRevoke(key.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Revoke Key"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Usage Instructions */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                  <Key size={18} className="text-blue-600 dark:text-blue-400" />
                  How to Use Your API Key
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Include your API key in the <code className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-700">X-API-Key</code> header when making requests:
                </p>
                <pre className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-lg text-xs overflow-x-auto border border-gray-700">
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
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                      <Shield className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account security preferences</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Password Change */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your password regularly for security</p>
                    </div>
                    <a
                      href="/auth/reset-password"
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      Update
                    </a>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <span className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      Coming Soon
                    </span>
                  </div>

                  {/* Session Management */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage devices that are signed in to your account</p>
                    </div>
                    <span className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Key className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active API Keys</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{keys.filter(k => k.is_active).length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Activity className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">Operational</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Zap className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">Pro</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h3 className="text-amber-900 dark:text-amber-300 font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Security Tips
                </h3>
                <ul className="text-amber-800 dark:text-amber-200 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    Never share your API keys with anyone
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    Rotate your API keys periodically
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    Two-factor authentication coming soon for enhanced security
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    Use strong, unique passwords for your account
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

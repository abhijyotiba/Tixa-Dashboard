'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { createClient } from '@/utils/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Key,
  Clock,
  ChevronRight,
  Zap,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

// Helper to calculate membership duration
function getMembershipDuration(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 60) return '1 month';
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  if (diffDays < 730) return '1 year';
  return `${Math.floor(diffDays / 365)} years`;
}

// Helper to get relative time
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setProfile({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        email_confirmed_at: user.email_confirmed_at || null,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (!confirm('Are you sure you want to sign out?')) return;

    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/auth/login');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
      setIsSigningOut(false);
    }
  }

  async function handlePasswordReset() {
    if (!profile?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess('Password reset email sent! Check your inbox.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email');
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Profile" description="Manage your account settings" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading profile...</span>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" description="Manage your account settings" />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Alerts */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                <p className="text-green-700 dark:text-green-300 text-sm flex-1">{success}</p>
                <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600 dark:hover:text-green-300 text-xl leading-none">&times;</button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xl leading-none">&times;</button>
              </div>
            </div>
          )}

          {/* Hero Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Gradient Banner */}
            <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            
            {/* Profile Info */}
            <div className="px-6 pb-6">
              {/* Avatar - positioned to overlap banner */}
              <div className="-mt-12 mb-4">
                <div className="h-24 w-24 rounded-2xl bg-white dark:bg-gray-700 shadow-lg border-4 border-white dark:border-gray-800 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
                  {profile?.email?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              </div>

              {/* Name & Email */}
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profile?.email?.split('@')[0] || 'User'}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail size={14} />
                  <span className="text-sm">{profile?.email}</span>
                  {profile?.email_confirmed_at && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Member Since */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member for</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile?.created_at ? getMembershipDuration(profile.created_at) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Active */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/30">
                  <Clock className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Active</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {profile?.last_sign_in_at ? getRelativeTime(profile.last_sign_in_at) : 'Now'}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                  <Zap className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Plan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Free</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Account Details</h3>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* User ID Row */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <User className="text-gray-600 dark:text-gray-400" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">User ID</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{profile?.id?.slice(0, 8)}...{profile?.id?.slice(-4)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(profile?.id || '');
                    setSuccess('User ID copied to clipboard');
                    setTimeout(() => setSuccess(null), 2000);
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Copy
                </button>
              </div>

              {/* Email Row */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Mail className="text-gray-600 dark:text-gray-400" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Email Address</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
                  </div>
                </div>
                {profile?.email_confirmed_at && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Verified</span>
                )}
              </div>

              {/* Created Date Row */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Calendar className="text-gray-600 dark:text-gray-400" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Account Created</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {profile?.created_at && new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance / Theme Preferences */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {/* Light Mode */}
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:border-white dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${
                    theme === 'light' ? 'bg-blue-100 dark:bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Sun className={`${theme === 'light' ? 'text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} size={16} />
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === 'light' ? 'text-blue-600 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>Light</span>
                </button>

                {/* Dark Mode */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:border-white dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${
                    theme === 'dark' ? 'bg-blue-100 dark:bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Moon className={`${theme === 'dark' ? 'text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} size={16} />
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-blue-600 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>Dark</span>
                </button>

                {/* System Mode */}
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                    theme === 'system'
                      ? 'border-blue-500 bg-blue-50 dark:border-white dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${
                    theme === 'system' ? 'bg-blue-100 dark:bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Monitor className={`${theme === 'system' ? 'text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`} size={16} />
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === 'system' ? 'text-blue-600 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>System</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security & Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Security & Actions</h3>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Password Reset */}
              <button 
                onClick={handlePasswordReset}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <Key className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Send a password reset link to your email</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" size={18} />
              </button>

              {/* API Keys Link */}
              <a
                href="/settings"
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                    <Shield className="text-purple-600 dark:text-purple-400" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">API Keys</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your API keys for SDK integration</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" size={18} />
              </a>

              {/* Sign Out */}
              <button 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                    <LogOut className="text-red-600 dark:text-red-400" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account on this device</p>
                  </div>
                </div>
                {isSigningOut ? (
                  <Loader2 className="text-red-400 animate-spin" size={18} />
                ) : (
                  <ChevronRight className="text-red-400" size={18} />
                )}
              </button>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

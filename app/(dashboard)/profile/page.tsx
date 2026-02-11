'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { createClient } from '@/utils/supabase/client';
import { User, Mail, Calendar, Shield, LogOut, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Success Alert */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Profile Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User ID */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                    {profile?.id}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Mail size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {profile?.email}
                  </p>
                  {profile?.email_confirmed_at && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={14} />
                      Email verified
                    </p>
                  )}
                </div>
              </div>

              {/* Account Created */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Created
                  </label>
                  <p className="text-sm text-gray-900">
                    {profile?.created_at && new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Last Sign In */}
              {profile?.last_sign_in_at && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Sign In
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(profile.last_sign_in_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Password</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Reset your password via email
                  </p>
                </div>
                <button
                  onClick={handlePasswordReset}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Send Reset Email
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50/50">
              <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sign out of your account on this device
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Signing Out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

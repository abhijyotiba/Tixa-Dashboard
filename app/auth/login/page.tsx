'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClient()

  function switchMode(newMode: AuthMode) {
    setMode(newMode)
    setError(null)
    setSuccess(false)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSuccess(true)
        setLoading(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#f5f5f0] overflow-hidden">
      {/* ─── LEFT SIDE: Branding Panel ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-8 xl:p-12 overflow-hidden">
        {/* Top section */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">T</span>
            </div>
            <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">
              Tixa Logger Platform
            </span>
          </div>

          {/* Headline */}
          <div className="relative max-w-lg">
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
              POWERED BY
              <br />
              <span className="relative inline-block">
                AI
                <span className="absolute bottom-0.5 left-0 w-full h-2.5 bg-emerald-300/60 -z-10 rounded-sm" />
              </span>{' '}
              FOR BUSINESSES
              <br />
              AROUND THE WORLD.
            </h1>

            {/* Green circular accents */}
            <div className="absolute -top-3 -right-4 w-4 h-4 rounded-full bg-emerald-400 opacity-80" />
            <div className="absolute top-6 -right-2 w-2.5 h-2.5 rounded-full bg-emerald-300 opacity-60" />
            <div className="absolute bottom-8 -right-6 w-3 h-3 rounded-full bg-emerald-500 opacity-50" />
          </div>
        </div>

        {/* Bottom cards — side by side, 90% width of left panel */}
        <div className="mt-auto w-[90%] flex gap-4 items-stretch">
          {/* Card 1 — smaller */}
          <div className="relative w-[35%] rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
            <div className="h-[180px] bg-gradient-to-br from-gray-800 to-gray-900 relative">
              <div className="absolute inset-0 opacity-25">
                <div className="absolute top-5 left-5 w-16 h-16 rounded-full border-2 border-white/40" />
                <div className="absolute top-10 left-11 w-12 h-12 rounded-full border-2 border-emerald-400/40" />
              </div>
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white/90 text-base font-medium">
                  Unified observability
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Logs · Traces · Metrics
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 — wider */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-[180px] bg-gradient-to-br from-emerald-700 to-emerald-900 relative">
              <div className="absolute inset-0 opacity-25">
                <div className="absolute top-5 right-5 w-16 h-16 rounded-full border-2 border-white/40" />
                <div className="absolute top-10 right-11 w-12 h-12 rounded-full border-2 border-white/30" />
              </div>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white/90 text-base font-medium">
                  AI-powered insights
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Automation · Analytics · Alerts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Auth Panel ─── */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-5 lg:p-8 h-screen">
        {/* Background with overlay */}
        <div className="absolute inset-0 lg:rounded-3xl overflow-hidden lg:m-3">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Floating Auth Card */}
        <div className="relative z-10 w-full max-w-[400px]">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8">
            {/* Card Header */}
            <div className="mb-5">
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-4 lg:hidden">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">T</span>
                </div>
                <span className="text-xs font-medium text-gray-500 tracking-widest uppercase">Tixa</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'login' ? 'Login to your account' : 'Create your account'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'login' 
                  ? 'Welcome back! Enter your credentials.' 
                  : 'Get started with Tixa today.'}
              </p>
            </div>

            {/* Success message for signup */}
            {success && mode === 'signup' ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Check your email</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        We&apos;ve sent a confirmation link to <span className="font-medium">{email}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors"
                >
                  Back to login
                </button>
              </div>
            ) : (
              /* Form */
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password for signup */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}

                {/* Remember me + Forgot password (login only) */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black/20 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push('/auth/reset-password')}
                      className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2">
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    mode === 'login' ? 'Sign in' : 'Create account'
                  )}
                </button>

                {/* Toggle between login/signup */}
                <p className="text-center text-xs text-gray-500 pt-2">
                  {mode === 'login' ? (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'

function GoogleMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function InlineLogin() {
  const router = useRouter()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const result = await authApi.login({ email: form.email.trim(), password: form.password })
      await acceptSession(result)
      router.replace('/feed')
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') setErrorMsg('Wrong email or password. Try again.')
      else if (err.code === 'VALIDATION_ERROR') setErrorMsg('Please fill in email and password.')
      else setErrorMsg(err.message || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Mini logo lockup */}
      <div className="flex items-center gap-1.5 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/icon.svg" alt="" className="w-8 h-8 object-contain" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-wordmark.svg" alt="StreamLink" className="h-5 w-auto" />
      </div>

      <h2 className="font-display text-[28px] sm:text-[32px] font-bold text-ink leading-tight">Welcome back</h2>
      <p className="text-[14px] text-muted mt-2">Sign in to your StreamLink account to continue</p>

      {/* Social */}
      <div className="mt-8">
        <Link href="/login"
          className="w-full h-[46px] inline-flex items-center justify-center gap-2 bg-[#F4F2FA] border-[1.5px] border-rule hover:border-sl-purple/40 hover:bg-white hover:shadow-[0_2px_16px_rgba(124,58,237,0.1)] text-ink text-[14px] font-medium rounded-xl transition">
          <GoogleMark className="w-[18px] h-[18px]" />
          Continue with Google
        </Link>
      </div>

      <div className="flex items-center gap-3 my-7 text-[12px] tracking-wider uppercase text-muted">
        <span className="flex-1 h-px bg-rule" />
        or continue with email
        <span className="flex-1 h-px bg-rule" />
      </div>

      {errorMsg && (
        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[12.5px] text-red-700 font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-muted uppercase tracking-wider mb-2">Email</label>
          <input type="email" required
            className="w-full bg-[#F4F2FA] border-[1.5px] border-rule rounded-xl px-[18px] py-[14px] text-[15px] outline-none focus:border-sl-purple/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)] transition"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrorMsg('') }}
            placeholder="you@example.com"
            autoComplete="email" autoCapitalize="none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-semibold text-muted uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" className="text-[12px] font-medium text-sl-purple hover:text-sl-pink transition">
              Forgot password?
            </Link>
          </div>
          <input type="password" required
            className="w-full bg-[#F4F2FA] border-[1.5px] border-rule rounded-xl px-[18px] py-[14px] text-[15px] outline-none focus:border-sl-purple/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(168,85,247,0.1)] transition"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrorMsg('') }}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading || !form.email || !form.password}
          className="relative overflow-hidden mt-3 h-[54px] inline-flex items-center justify-center gap-2 text-white text-[16px] font-bold tracking-wide rounded-xl transition disabled:opacity-60 bg-streamlink hover:opacity-95 hover:-translate-y-px shadow-[0_6px_24px_rgba(232,52,122,0.28)] hover:shadow-[0_10px_32px_rgba(232,52,122,0.36)] font-display">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </>
          ) : 'Sign in to StreamLink'}
        </button>
      </form>

      <p className="text-center text-[14px] text-muted mt-6">
        New here?{' '}
        <Link href="/register" className="text-sl-purple hover:text-sl-pink font-semibold transition">
          Create your free profile →
        </Link>
      </p>
    </div>
  )
}

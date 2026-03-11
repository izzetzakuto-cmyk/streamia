import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useAppStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })

      if (error) {
        // Show friendly error messages inline (never get stuck)
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg('📧 Please check your email inbox and click the confirmation link we sent you.')
        } else if (error.message.toLowerCase().includes('invalid login') || error.message.toLowerCase().includes('invalid credentials')) {
          setErrorMsg('❌ Wrong email or password. Please try again.')
        } else if (error.message.toLowerCase().includes('too many')) {
          setErrorMsg('⏳ Too many attempts. Please wait a minute and try again.')
        } else {
          setErrorMsg(error.message)
        }
        setLoading(false)
        return
      }

      if (data?.session) {
        // Logged in successfully — navigate to feed
        navigate('/feed', { replace: true })
      }
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-6">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
          Stream<span className="text-accent">Link</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

        {/* Inline error message — never gets stuck silently */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input
              type="email" required
              className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrorMsg('') }}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
            <input
              type="password" required
              className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              value={form.password}
              onChange={e => { setForm({ ...form, password: e.target.value }); setErrorMsg('') }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !form.email || !form.password}
            className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">Join free</Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, profileApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import PlatformPicker from '@/components/ui/PlatformPicker'
import ImageUpload from '@/components/ui/ImageUpload'
import { COUNTRIES, LANGUAGES } from '@/lib/countries'

export default function RegisterPage() {
  const navigate = useNavigate()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const [accountType, setAccountType] = useState(null) // null | 'streamer' | 'company'
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({
    email: '', password: '',
    first_name: '', last_name: '',
    display_name: '', handle: '',
    bio: '', category: '',
    country: 'TR', language: 'en',
    platforms: [],
    avatar_url: '',
  })

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (form.handle.length < 3) {
      setErrorMsg('Handle must be at least 3 characters')
      return
    }
    if (form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const result = await authApi.signup({
        email: form.email.trim(),
        password: form.password,
        displayName: form.display_name.trim(),
        handle: form.handle.toLowerCase(),
        firstName: form.first_name.trim() || null,
        lastName: form.last_name.trim() || null,
        country: form.country || undefined,
        language: form.language || 'tr',
      })
      await acceptSession(result)

      // Patch additional profile fields that don't fit the signup body
      const patch = {}
      if (form.bio) patch.bio = form.bio
      if (form.category) patch.category = form.category
      if (form.platforms.length) patch.platforms = form.platforms
      if (form.avatar_url) patch.avatarUrl = form.avatar_url
      if (Object.keys(patch).length) {
        try { await profileApi.updateMe(patch) } catch { /* non-fatal */ }
      }

      navigate('/feed', { replace: true })
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') setErrorMsg('This email is already registered. Try signing in instead.')
      else if (err.code === 'HANDLE_TAKEN') setErrorMsg('That handle is already taken. Please choose another.')
      else if (err.code === 'VALIDATION_ERROR') setErrorMsg('Please check your inputs and try again.')
      else setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Show account type picker first
  if (!accountType) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
          <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-6">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
            Stream <span className="text-accent">Link</span>
          </div>
          <h1 className="text-[22px] font-extrabold mb-1">Join Streamia</h1>
          <p className="text-sm text-gray-400 mb-6">How do you want to use Streamia?</p>

          <div className="space-y-3">
            <button onClick={() => setAccountType('streamer')}
              className="w-full p-4 border-2 border-gray-200 hover:border-accent hover:bg-accent-lt rounded-2xl text-left transition group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-purple-400 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🎮</div>
                <div className="flex-1">
                  <div className="font-extrabold text-[15px] group-hover:text-accent transition">I'm a Streamer</div>
                  <div className="text-[12.5px] text-gray-400 mt-0.5">Find brand deals, connect with creators, grow your network</div>
                </div>
                <span className="text-gray-300 group-hover:text-accent text-xl transition">→</span>
              </div>
              <div className="mt-2 ml-16">
                <span className="text-[11px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">Always Free</span>
              </div>
            </button>

            <button onClick={() => navigate('/register/company')}
              className="w-full p-4 border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 rounded-2xl text-left transition group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🏢</div>
                <div className="flex-1">
                  <div className="font-extrabold text-[15px] group-hover:text-purple-600 transition">I'm a Brand / Company</div>
                  <div className="text-[12.5px] text-gray-400 mt-0.5">Post deals, find creators, run campaigns at scale</div>
                </div>
                <span className="text-gray-300 group-hover:text-purple-500 text-xl transition">→</span>
              </div>
              <div className="mt-2 ml-16">
                <span className="text-[11px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">Free + Paid plans</span>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-5">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
          Stream <span className="text-accent">Link</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Create your profile</h1>
        <p className="text-sm text-gray-400 mb-5">Join 42,000+ streamers</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">First name <span className="font-normal text-gray-300">(optional)</span></label>
              <input type="text"
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                placeholder="Jordan"
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Last name <span className="font-normal text-gray-300">(optional)</span></label>
              <input type="text"
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                placeholder="Rivera"
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Display Name</label>
              <input required type="text"
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                placeholder="ArcherKnight"
                value={form.display_name}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Handle</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input required type="text"
                  className="w-full h-10 bg-bg border border-gray-200 rounded-lg pl-6 pr-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  placeholder="archerknight"
                  value={form.handle}
                  onChange={e => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input required type="email"
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
            <input required type="password" minLength={8}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Country</label>
              <select
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Language</label>
              <select
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Profile Photo <span className="font-normal text-gray-300">(optional)</span></label>
            <ImageUpload
              kind="avatar"
              value={form.avatar_url}
              onChange={(url) => setForm({ ...form, avatar_url: url })}
              label="Upload photo"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Your Streaming Platforms</label>
            <PlatformPicker
              value={form.platforms}
              onChange={(slugs) => setForm({ ...form, platforms: slugs })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Content Category</label>
            <input type="text"
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              placeholder="e.g. FPS, Just Chatting, Music…"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
            <textarea rows={2}
              className="w-full bg-bg border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white transition resize-none"
              placeholder="Tell other streamers about yourself…"
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating profile…
              </>
            ) : 'Create my profile →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

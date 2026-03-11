import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'

const PLATFORMS = [
  { id: 'twitch',  label: 'Twitch',  icon: '🟣', cls: 'border-purple-400 bg-purple-50 text-purple-700' },
  { id: 'kick',    label: 'Kick',    icon: '🟢', cls: 'border-green-400 bg-green-50 text-green-700' },
  { id: 'youtube', label: 'YouTube', icon: '🔴', cls: 'border-red-400 bg-red-50 text-red-700' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '', password: '', display_name: '',
    handle: '', bio: '', category: '', platforms: []
  })

  const togglePlatform = (p) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter(x => x !== p)
        : [...f.platforms, p]
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          display_name: form.display_name,
          handle: form.handle,
        }
      }
    })

    if (error) {
      showToast(error.message, 'error')
      setLoading(false)
      return
    }

    // Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: form.display_name,
        handle: form.handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: form.bio,
        category: form.category,
        platforms: form.platforms,
        created_at: new Date().toISOString(),
      })
    }

    showToast('🚀 Welcome to StreamLink!')
    navigate('/feed')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-5">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
          Stream<span className="text-accent">Link</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Create your profile</h1>
        <p className="text-sm text-gray-400 mb-5">Join 42,000+ streamers</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-3">
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
                  onChange={e => setForm({ ...form, handle: e.target.value })}
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
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
            <input required type="password" minLength={8}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Your Platforms</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map(p => (
                <button key={p.id} type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`py-2 px-2 rounded-xl border-2 text-xs font-bold text-center transition
                    ${form.platforms.includes(p.id) ? p.cls + ' border-opacity-100' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                >
                  <div className="text-lg mb-1">{p.icon}</div>
                  {p.label}
                </button>
              ))}
            </div>
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
            className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition mt-1 disabled:opacity-60"
          >
            {loading ? 'Creating profile…' : 'Create my profile →'}
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

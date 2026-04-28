import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { profileApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
]

export default function LanguageSwitcher({ variant = 'button' }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const { user, fetchProfile } = useAuthStore()

  const current = (i18n.language || 'en').slice(0, 2)
  const currentLabel = LANGS.find((l) => l.code === current)?.label ?? 'English'

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [open])

  const choose = async (code) => {
    setOpen(false)
    if (code === current) return
    await i18n.changeLanguage(code)
    localStorage.setItem('sl_lang', code)
    // Persist to profile when signed in
    if (user?.id) {
      try {
        await profileApi.updateMe({ language: code })
        await fetchProfile()
      } catch { /* non-fatal */ }
    }
  }

  if (variant === 'select') {
    return (
      <select value={current} onChange={(e) => choose(e.target.value)}
        className="h-9 bg-white border border-gray-200 rounded-full px-3 text-[12.5px] font-bold outline-none focus:border-accent">
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
        <Globe className="w-3.5 h-3.5" strokeWidth={2.25} />
        {currentLabel}
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-xl shadow-lg w-36 py-1 z-50">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => choose(l.code)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[12.5px] hover:bg-gray-50 transition">
              <span>{l.label}</span>
              {l.code === current && <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

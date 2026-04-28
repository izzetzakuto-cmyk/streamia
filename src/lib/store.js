import { create } from 'zustand'
import i18n from 'i18next'
import { authApi, profileApi, tokens } from '@/lib/api'
import { disconnectSocket } from '@/lib/socket'

function applyLanguage(lang) {
  if (!lang) return
  const code = lang.slice(0, 2)
  if (i18n.language?.slice(0, 2) !== code) {
    i18n.changeLanguage(code).catch(() => {})
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,       // { id, email, emailVerified }
  profile: null,    // profile row from /profiles/me
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  // Called once on App mount to hydrate state from stored access token.
  bootstrap: async () => {
    try {
      if (!tokens.getAccess()) {
        set({ user: null, profile: null, loading: false })
        return
      }
      const me = await authApi.me()
      const { profile, ...user } = me
      applyLanguage(profile?.language)
      set({ user, profile, loading: false })
    } catch {
      tokens.clear()
      set({ user: null, profile: null, loading: false })
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await profileApi.me()
      applyLanguage(profile?.language)
      set({ profile })
      return profile
    } catch {
      return null
    }
  },

  // After login/signup — persist tokens and load user.
  acceptSession: async ({ accessToken, refreshToken }) => {
    tokens.set({ accessToken, refreshToken })
    const me = await authApi.me()
    const { profile, ...user } = me
    applyLanguage(profile?.language)
    set({ user, profile, loading: false })
  },

  signOut: async () => {
    const rt = tokens.getRefresh()
    if (rt) {
      try { await authApi.logout(rt) } catch { /* ignore */ }
    }
    tokens.clear()
    disconnectSocket()
    set({ user: null, profile: null, loading: false })
  },
}))

export const useAppStore = create((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))

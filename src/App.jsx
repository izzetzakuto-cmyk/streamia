import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

// Pages
import LandingPage   from '@/pages/LandingPage'
import LoginPage     from '@/pages/LoginPage'
import RegisterPage  from '@/pages/RegisterPage'
import FeedPage      from '@/pages/FeedPage'
import ProfilePage   from '@/pages/ProfilePage'
import MessagesPage  from '@/pages/MessagesPage'
import NetworkPage   from '@/pages/NetworkPage'
import JobsPage      from '@/pages/JobsPage'
import OffersPage    from '@/pages/OffersPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import CompaniesPage from '@/pages/CompaniesPage'

// Layout
import AppLayout     from '@/components/layout/AppLayout'
import Toast         from '@/components/layout/Toast'

// Protected route wrapper
function Protected({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public routes */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected app routes */}
        <Route element={<Protected><AppLayout /></Protected>}>
          <Route path="/feed"       element={<FeedPage />} />
          <Route path="/profile/:id?" element={<ProfilePage />} />
          <Route path="/messages"   element={<MessagesPage />} />
          <Route path="/network"    element={<NetworkPage />} />
          <Route path="/jobs"       element={<JobsPage />} />
          <Route path="/offers"     element={<OffersPage />} />
          <Route path="/analytics"  element={<AnalyticsPage />} />
          <Route path="/companies"  element={<CompaniesPage />} />
          <Route path="/app"        element={<Navigate to="/feed" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

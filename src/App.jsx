import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

import { lazy, Suspense } from 'react'

// Lazy load every page — only loads when user visits that page
const LandingPage   = lazy(() => import('@/pages/LandingPage'))
const LoginPage     = lazy(() => import('@/pages/LoginPage'))
const RegisterPage  = lazy(() => import('@/pages/RegisterPage'))
const FeedPage      = lazy(() => import('@/pages/FeedPage'))
const ProfilePage   = lazy(() => import('@/pages/ProfilePage'))
const MessagesPage  = lazy(() => import('@/pages/MessagesPage'))
const NetworkPage   = lazy(() => import('@/pages/NetworkPage'))
const JobsPage      = lazy(() => import('@/pages/JobsPage'))
const OffersPage    = lazy(() => import('@/pages/OffersPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
const PricingPage   = lazy(() => import('@/pages/PricingPage'))
import PricingPage   from '@/pages/PricingPage'

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

  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-gray-400 font-medium">Loading…</div>
      </div>
    </div>
  )

  return (
    <BrowserRouter>
      <Toast />
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/pricing"    element={<PricingPage />} />
          <Route path="/app"        element={<Navigate to="/feed" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

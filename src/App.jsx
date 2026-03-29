import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'
import AppLayout from '@/components/layout/AppLayout'
import Toast     from '@/components/layout/Toast'

// Critical pages — load immediately (users land here first)
import LandingPage        from '@/pages/LandingPage'
import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage      from '@/pages/ResetPasswordPage'
import RegisterCompanyPage from '@/pages/RegisterCompanyPage'

// App pages — lazy load after login (saves ~300KB on first visit)
const FeedPage      = lazy(() => import('@/pages/FeedPage'))
const ProfilePage   = lazy(() => import('@/pages/ProfilePage'))
const MessagesPage  = lazy(() => import('@/pages/MessagesPage'))
const NetworkPage   = lazy(() => import('@/pages/NetworkPage'))
const JobsPage      = lazy(() => import('@/pages/JobsPage'))
const OffersPage    = lazy(() => import('@/pages/OffersPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
const PricingPage   = lazy(() => import('@/pages/PricingPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <div className="text-xs text-gray-400 font-medium">Loading…</div>
    </div>
  </div>
)

function Protected({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnly({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          if (session?.user) await fetchProfile(session.user.id)
        }
        if (event === 'SIGNED_OUT') setUser(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register"        element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/reset-password"      element={<ResetPasswordPage />} />
          <Route path="/register/company" element={<PublicOnly><RegisterCompanyPage /></PublicOnly>} />

          <Route element={<Protected><AppLayout /></Protected>}>
            <Route path="/feed"         element={<FeedPage />} />
            <Route path="/profile/:id?" element={<ProfilePage />} />
            <Route path="/messages"     element={<MessagesPage />} />
            <Route path="/network"      element={<NetworkPage />} />
            <Route path="/jobs"         element={<JobsPage />} />
            <Route path="/offers"       element={<OffersPage />} />
            <Route path="/analytics"    element={<AnalyticsPage />} />
            <Route path="/companies"    element={<CompaniesPage />} />
            <Route path="/pricing"      element={<PricingPage />} />
            <Route path="/app"          element={<Navigate to="/feed" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

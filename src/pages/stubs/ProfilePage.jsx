// Stub pages — replace each with full implementation
import { useAuthStore } from '@/lib/store'
import { useNavigate } from 'react-router-dom'

function ComingSoon({ title, icon, description }) {
  return (
    <div className="max-w-[1100px] mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
        <div className="text-5xl mb-4">{icon}</div>
        <h1 className="text-2xl font-extrabold mb-2">{title}</h1>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

export function ProfilePageComponent() {
  const { profile } = useAuthStore()
  const initials = profile?.display_name?.slice(0,2).toUpperCase() || 'ME'
  return (
    <div className="max-w-[900px] mx-auto px-4 py-5">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100" />
        <div className="px-6 pb-6">
          <div className="flex items-flex-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-purple-400 border-4 border-white flex items-center justify-center text-white font-extrabold text-2xl">
              {initials}
            </div>
            <div className="pt-10 flex-1">
              <h1 className="text-xl font-extrabold">{profile?.display_name || 'Your Name'}</h1>
              <p className="text-sm text-gray-400">@{profile?.handle || 'yourhandle'}</p>
            </div>
            <div className="pt-10 flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-full text-sm font-bold hover:border-gray-400 transition">Edit Profile</button>
              <button className="px-4 py-2 bg-live text-white rounded-full text-sm font-bold hover:opacity-90 transition">🔴 Go Live</button>
            </div>
          </div>
          <p className="text-[13.5px] text-gray-600 mb-4">{profile?.bio || 'No bio yet — edit your profile to add one.'}</p>
          {profile?.platforms?.length > 0 && (
            <div className="flex gap-2">
              {profile.platforms.includes('twitch')  && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">🟣 Twitch</span>}
              {profile.platforms.includes('kick')    && <span className="px-3 py-1 bg-green-50  text-green-700  rounded-full text-xs font-bold">🟢 Kick</span>}
              {profile.platforms.includes('youtube') && <span className="px-3 py-1 bg-red-50    text-red-700    rounded-full text-xs font-bold">🔴 YouTube</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePageComponent

export function MessagesPageStub()  { return <ComingSoon title="Messages"  icon="💬" description="Real-time DMs coming soon." /> }
export function NetworkPageStub()   { return <ComingSoon title="Network"   icon="👥" description="Find and connect with streamers." /> }
export function JobsPageStub()      { return <ComingSoon title="Jobs"      icon="💼" description="Brand deals and opportunities." /> }
export function OffersPageStub()    { return <ComingSoon title="Offers"    icon="⭐" description="Incoming brand offers matched to you." /> }
export function AnalyticsPageStub() { return <ComingSoon title="Analytics" icon="📊" description="Your streaming stats and growth." /> }
export function CompaniesPageStub() { return <ComingSoon title="Companies" icon="🏢" description="Discover brands looking for creators." /> }

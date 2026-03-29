import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'

const NAV_ITEMS = [
  { to: '/feed',      icon: '🏠', label: 'Home' },
  { to: '/network',   icon: '👥', label: 'Network' },
  { to: '/jobs',      icon: '💼', label: 'Jobs' },
  { to: '/offers',    icon: '⭐', label: 'Offers', badge: 3 },
  { to: '/messages',  icon: '💬', label: 'Messages', badge: 2 },
  { to: '/analytics', icon: '📊', label: 'Stats' },
  { to: '/companies', icon: '🏢', label: 'Brands' },
  { to: '/pricing',   icon: '💎', label: 'Upgrade' },
]

// Bottom 5 for mobile tab bar
const MOBILE_NAV = [
  { to: '/feed',     icon: '🏠', label: 'Home' },
  { to: '/network',  icon: '👥', label: 'Network' },
  { to: '/jobs',     icon: '💼', label: 'Jobs' },
  { to: '/messages', icon: '💬', label: 'Messages', badge: 2 },
  { to: '/offers',   icon: '⭐', label: 'Offers', badge: 3 },
]

export default function AppLayout() {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : 'ME'

  return (
    <div className="min-h-screen bg-bg">

      {/* ── DESKTOP NAV (hidden on mobile) ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 hidden md:flex items-center px-4 gap-2">
        <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight cursor-pointer flex-shrink-0"
          onClick={() => navigate('/feed')}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-sm">⚡</div>
          Stream<span className="text-accent">Link</span>
        </div>

        <div className="relative flex-1 max-w-[240px] ml-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          <input type="text" placeholder="Search…"
            className="w-full h-[34px] bg-bg border border-transparent rounded-full pl-8 pr-3 text-[13px] outline-none focus:bg-white focus:border-accent transition" />
        </div>

        <div className="flex items-center gap-px ml-auto">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-[2px] px-2.5 py-1 rounded-lg text-[10px] font-bold transition
                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
              {({ isActive }) => (<>
                <span className="text-[17px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute top-[2px] right-[4px] bg-live text-white text-[9px] font-black min-w-[14px] h-[14px] rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
                {isActive && <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-5 h-[2px] bg-gray-900 rounded" />}
              </>)}
            </NavLink>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-xs flex items-center justify-center cursor-pointer ring-2 ring-green-400"
              onClick={() => setShowMenu(!showMenu)}>
              {initials}
            </div>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg w-44 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-[13px] font-bold">{profile?.display_name}</div>
                  <div className="text-[11px] text-gray-400">@{profile?.handle}</div>
                </div>
                <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/profile'); setShowMenu(false) }}>👤 My Profile</button>
                <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/analytics'); setShowMenu(false) }}>📊 Analytics</button>
                <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/companies'); setShowMenu(false) }}>🏢 Companies</button>
                <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/pricing'); setShowMenu(false) }}>💎 Upgrade</button>
                <button className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 border-t border-gray-100 mt-1" onClick={signOut}>🚪 Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE TOP BAR (hidden on desktop) ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex md:hidden items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight cursor-pointer"
          onClick={() => navigate('/feed')}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-sm">⚡</div>
          Stream<span className="text-accent">Link</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-live rounded-full border-2 border-white" />
          </button>

          {/* Avatar → profile */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-sm flex items-center justify-center cursor-pointer ring-2 ring-green-400"
              onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {initials}
            </div>
            {showMobileMenu && (
              <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl w-48 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <div className="text-[13px] font-bold">{profile?.display_name}</div>
                  <div className="text-[11px] text-gray-400">@{profile?.handle}</div>
                </div>
                <button className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/profile'); setShowMobileMenu(false) }}>👤 My Profile</button>
                <button className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/analytics'); setShowMobileMenu(false) }}>📊 Analytics</button>
                <button className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/companies'); setShowMobileMenu(false) }}>🏢 Companies</button>
                <button className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { navigate('/pricing'); setShowMobileMenu(false) }}>💎 Upgrade</button>
                <button className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 border-t border-gray-100" onClick={signOut}>🚪 Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT — extra bottom padding on mobile for tab bar */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden safe-area-pb">
        {MOBILE_NAV.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition
              ${isActive ? 'text-accent' : 'text-gray-400'}`}>
            <span className="text-[22px] leading-none">{item.icon}</span>
            <span className="text-[10px] font-bold">{item.label}</span>
            {item.badge && (
              <span className="absolute top-1.5 right-[18%] bg-live text-white text-[8px] font-black min-w-[14px] h-[14px] rounded-full flex items-center justify-center border-2 border-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="border-b border-gray-100 h-14 flex items-center px-8 gap-4">
        <div className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-sm">⚡</div>
          Stream<span className="text-accent">Link</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link to="/login"    className="text-sm font-semibold text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link to="/register" className="px-4 py-2 bg-accent hover:bg-accent-dk text-white text-sm font-bold rounded-full transition">Join free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 grid grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-lt text-accent rounded-full text-[11.5px] font-bold uppercase tracking-wider mb-5">
            🎙️ Built for Livestreamers
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-4">
            Welcome to your<br /><span className="text-accent">streaming career</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-7 max-w-md">
            Connect with top streamers, land brand deals, find collaborators, and grow your channel — all in one professional network built for creators.
          </p>
          <div className="flex gap-3 mb-8">
            <Link to="/register" className="px-6 py-3 bg-accent hover:bg-accent-dk text-white font-bold rounded-full transition">Get started — it's free</Link>
            <Link to="/login"    className="px-6 py-3 border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-full transition">Explore the feed →</Link>
          </div>
          <div className="flex gap-3">
            {[['🟣','Twitch'],['🟢','Kick'],['🔴','YouTube']].map(([icon,name]) => (
              <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold">
                {icon} {name}
              </div>
            ))}
          </div>
          <div className="flex gap-8 mt-9 pt-7 border-t border-gray-100">
            {[['42K+','Streamers'],['8,300','Live now'],['$2.4M','Deals closed']].map(([n,l]) => (
              <div key={l}>
                <div className="text-[22px] font-extrabold tracking-tight">{n}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-xs">SV</div>
              <div><div className="text-xs font-bold">ShadowViper 🎉</div><div className="text-[10px] text-gray-400">Twitch Partner · Horror</div></div>
            </div>
            <p className="text-xs text-gray-600">Just hit <b>100,000 followers</b> on Twitch! 3 years of late nights ❤️</p>
            <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100">
              {['❤️ 3.2K','💬 847','↗️ Share'].map(a => <span key={a} className="text-[10.5px] text-gray-400 font-semibold cursor-pointer">{a}</span>)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-gray-900 font-bold text-[10px]">NX</div>
              <div><div className="text-xs font-bold">NeonXtra</div><div className="text-[9px] text-gray-400">🟢 Kick</div></div>
            </div>
            <p className="text-[11px] text-gray-600">🤝 Looking for FPS duo collab!</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div className="text-[9.5px] font-bold text-amber-700 mb-1">💰 BRAND DEAL</div>
            <div className="text-xs font-bold mb-1">RedBull Gaming</div>
            <div className="text-[11px] text-gray-600">FPS streamers 50K+ — $2,500/stream</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Everything a streamer needs</h2>
          <p className="text-gray-500">One platform. Your entire streaming career.</p>
        </div>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-5">
          {[
            ['🤝','Network','Connect with 42K+ streamers, find collab partners, build your community.'],
            ['💰','Brand Deals','Get matched with brands, apply for sponsorships, earn real money.'],
            ['📊','Analytics','Track your growth, viewer stats, and revenue all in one dashboard.'],
            ['💬','Messages','DM any streamer or brand directly — no middleman needed.'],
            ['🏢','Companies','Discover agencies and brands actively looking for creators like you.'],
            ['📅','Schedule','Share your stream calendar and let your audience plan ahead.'],
          ].map(([icon,title,desc]) => (
            <div key={title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="font-bold mb-1">{title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready to grow your streaming career?</h2>
        <p className="text-gray-500 mb-7">Join thousands of streamers already on StreamLink. Free forever.</p>
        <Link to="/register" className="px-8 py-3.5 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-[15px] transition">
          Create your free profile →
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2025 StreamLink · Built for streamers, by streamers
      </footer>
    </div>
  )
}

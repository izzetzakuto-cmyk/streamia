import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useAppStore } from '@/lib/store'

const FILTERS = ['All', 'Sponsors', 'Esports', 'Agencies', 'Hardware', 'Streaming']
const INDUSTRIES = ['Esports', 'Gaming Hardware', 'Energy & Beverages', 'Streaming Platform', 'Talent Agency', 'Game Publisher', 'Apparel', 'Tech & Software', 'Other']
const PARTNERSHIP_TYPES = ['Sponsored Streams', 'Brand Ambassadors', 'Product Reviews', 'Event Coverage', 'Long-term Deals', 'Affiliate Programs']

const SEED_COMPANIES = [
  { id: 'c1', name: 'RedBull Gaming', slug: 'redbull-gaming', industry: 'Energy & Beverages', description: 'RedBull Gaming partners with top streamers and esports athletes worldwide. We believe in giving creators wings — through content support, competitive pay, and long-term brand relationships.', logo: '🐂', followers_count: 12400, is_verified: true, looking_for: ['FPS Streamers', 'Just Chatting', 'Esports Coverage'], location: 'Vienna, Austria', website: 'https://redbull.com/gaming', jobs: 3, bg: 'from-red-500 to-red-700' },
  { id: 'c2', name: 'SteelSeries', slug: 'steelseries', industry: 'Gaming Hardware', description: 'SteelSeries has been equipping professional gamers and streamers since 2001. We make the peripherals that serious streamers rely on. Join our ambassador program and represent best-in-class gear.', logo: '🎧', followers_count: 8900, is_verified: true, looking_for: ['FPS', 'MOBA', 'Pro Gamers'], location: 'Chicago, USA', website: 'https://steelseries.com', jobs: 2, bg: 'from-orange-500 to-orange-700' },
  { id: 'c3', name: 'G2 Esports', slug: 'g2-esports', industry: 'Esports', description: 'G2 Esports is one of the most successful esports organizations in the world. We\'re always looking for talented content creators, streamers, and media personalities to join our roster.', logo: '🏆', followers_count: 24100, is_verified: true, looking_for: ['Content Creators', 'Streamers', 'Podcast Hosts'], location: 'Berlin, Germany', website: 'https://g2esports.com', jobs: 5, bg: 'from-yellow-400 to-orange-500' },
  { id: 'c4', name: 'ASUS ROG', slug: 'asus-rog', industry: 'Gaming Hardware', description: 'Republic of Gamers is ASUS\'s dedicated gaming brand. We collaborate with streamers for authentic product reviews, setup showcases, and tech content. We reward honest opinions and great audiences.', logo: '🖥️', followers_count: 15700, is_verified: true, looking_for: ['Tech Reviewers', 'Setup Tours', 'PC Gaming'], location: 'Taipei, Taiwan', website: 'https://rog.asus.com', jobs: 4, bg: 'from-blue-600 to-blue-800' },
  { id: 'c5', name: 'StreamMax Agency', slug: 'streammax', industry: 'Talent Agency', description: 'StreamMax represents mid-tier to top-tier streamers and connects them with premium brand deals. We handle negotiations, contracts, and campaign management so creators can focus on streaming.', logo: '🎙️', followers_count: 3200, is_verified: false, looking_for: ['All Platforms', '10K+ Followers', 'Consistent Schedule'], location: 'Los Angeles, USA', website: 'https://streammax.agency', jobs: 1, bg: 'from-purple-500 to-purple-700' },
  { id: 'c6', name: 'ESL Gaming', slug: 'esl-gaming', industry: 'Esports', description: 'ESL is the world\'s largest esports company, running major tournaments across all titles. We hire streamers and content creators for tournament coverage, on-air talent, and social media.', logo: '🎮', followers_count: 31000, is_verified: true, looking_for: ['Tournament Hosts', 'Analysts', 'Social Media'], location: 'Cologne, Germany', website: 'https://esl.com', jobs: 6, bg: 'from-green-600 to-green-800' },
]

export default function CompaniesPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [companies, setCompanies] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [companyTab, setCompanyTab] = useState('Overview')
  const [showCreate, setShowCreate] = useState(false)
  const [followed, setFollowed] = useState(new Set())
  const [createForm, setCreateForm] = useState({ name: '', industry: '', website: '', description: '', looking_for: [] })
  const [creating, setCreating] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('*').order('followers_count', { ascending: false })
    const all = (data && data.length > 0) ? data : SEED_COMPANIES
    setCompanies(all)
    setSelected(all[0])
  }

  const toggleFollow = (id, name) => {
    setFollowed(s => {
      const next = new Set(s)
      if (next.has(id)) { next.delete(id); showToast(`Unfollowed ${name}`) }
      else { next.add(id); showToast(`✅ Following ${name}!`) }
      return next
    })
  }

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.industry) return
    setCreating(true)
    const slug = createForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const { error } = await supabase.from('companies').insert({
      owner_id: profile.id,
      name: createForm.name,
      slug,
      industry: createForm.industry,
      website: createForm.website,
      description: createForm.description,
      looking_for: createForm.looking_for,
    })
    if (error) showToast(error.message, 'error')
    else {
      showToast('🎉 Company page created!')
      setShowCreate(false)
      setCreateForm({ name: '', industry: '', website: '', description: '', looking_for: [] })
      fetchCompanies()
    }
    setCreating(false)
  }

  const togglePartnerType = (pt) => {
    setCreateForm(f => ({
      ...f,
      looking_for: f.looking_for.includes(pt)
        ? f.looking_for.filter(x => x !== pt)
        : [...f.looking_for, pt]
    }))
  }

  useEffect(() => { fetchCompanies() }, [])

  const filterMap = { 'Sponsors': ['Energy & Beverages', 'Tech & Software'], 'Esports': ['Esports'], 'Agencies': ['Talent Agency'], 'Hardware': ['Gaming Hardware'], 'Streaming': ['Streaming Platform'] }
  const filtered = companies.filter(c => {
    const matchFilter = filter === 'All' || filterMap[filter]?.includes(c.industry)
    const matchSearch = !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          {/* Header bar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
            <input type="text" placeholder="🔍 Search companies…"
              className="flex-1 h-9 bg-bg border border-gray-200 rounded-full px-4 text-[13px] outline-none focus:border-accent"
              value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition ${filter === f ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowCreate(true)} className="flex-shrink-0 px-4 py-2 bg-accent hover:bg-accent-dk text-white font-bold text-[12.5px] rounded-full transition whitespace-nowrap">+ Create Page</button>
          </div>

          {/* Selected company detail */}
          {selected && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className={`h-28 bg-gradient-to-r ${selected.bg || 'from-gray-400 to-gray-600'} flex items-end px-6 pb-4`}>
                <div className="text-5xl">{selected.logo || '🏢'}</div>
              </div>
              <div className="px-6 pt-4 pb-2 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] font-extrabold">{selected.name}</h2>
                      {selected.is_verified && <span className="text-[10.5px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded-full">✓ Verified</span>}
                    </div>
                    <div className="text-[12.5px] text-gray-400 mt-0.5">{selected.industry} · {selected.location}</div>
                    <div className="flex gap-3 mt-2 text-[12px] text-gray-500">
                      <span>👥 {(selected.followers_count || 0).toLocaleString()} followers</span>
                      <span>💼 {selected.jobs || 0} open roles</span>
                      {selected.website && <a href={selected.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">🔗 Website</a>}
                    </div>
                  </div>
                  <button onClick={() => toggleFollow(selected.id, selected.name)}
                    className={`px-5 py-2 rounded-full font-bold text-[13px] transition
                      ${followed.has(selected.id) ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'border-2 border-accent text-accent hover:bg-accent hover:text-white'}`}>
                    {followed.has(selected.id) ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
                <div className="flex gap-px mt-3">
                  {['Overview','Open Deals','Updates'].map(t => (
                    <button key={t} onClick={() => setCompanyTab(t)}
                      className={`relative px-5 py-2.5 text-[13px] font-bold transition ${companyTab === t ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                      {t}
                      {companyTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {companyTab === 'Overview' && (
                  <div className="space-y-4">
                    <p className="text-[13.5px] text-gray-700 leading-relaxed">{selected.description}</p>
                    {selected.looking_for?.length > 0 && (
                      <div>
                        <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Looking For</div>
                        <div className="flex flex-wrap gap-2">
                          {selected.looking_for.map(l => <span key={l} className="px-3 py-1.5 bg-accent-lt text-accent font-bold text-[12px] rounded-full">{l}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {companyTab === 'Open Deals' && (
                  <div className="space-y-3">
                    {Array.from({ length: selected.jobs || 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-accent hover:bg-accent-lt transition cursor-pointer">
                        <div>
                          <div className="text-[13.5px] font-bold">Brand Partnership #{i + 1}</div>
                          <div className="text-[12px] text-gray-400">{selected.looking_for?.[i] || 'Content Creator'} · Ongoing</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-bold text-accent">$1,500–3,000</div>
                          <div className="text-[11px] text-gray-400">per month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {companyTab === 'Updates' && (
                  <div className="space-y-4">
                    {[{ text: `${selected.name} just launched a new creator program for 2025. Applications open now.`, ago: '2 days ago' }, { text: `We're attending GDC 2025 and looking to meet creators in person. Reach out!`, ago: '1 week ago' }].map((u, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xl">{selected.logo}</div>
                          <div className="text-[13px] font-bold">{selected.name}</div>
                          <div className="text-[11px] text-gray-400 ml-auto">{u.ago}</div>
                        </div>
                        <p className="text-[13px] text-gray-600">{u.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Companies grid */}
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(c => (
              <div key={c.id} onClick={() => { setSelected(c); setCompanyTab('Overview') }}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition ${selected?.id === c.id ? 'border-accent' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{c.logo || '🏢'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold flex items-center gap-1">{c.name} {c.is_verified && <span className="text-blue-500 text-[11px]">✓</span>}</div>
                    <div className="text-[11px] text-gray-400">{c.industry}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11.5px] text-gray-400">👥 {(c.followers_count || 0).toLocaleString()}</span>
                  <button onClick={e => { e.stopPropagation(); toggleFollow(c.id, c.name) }}
                    className={`text-[11.5px] font-bold px-3 py-1 rounded-full border transition
                      ${followed.has(c.id) ? 'border-gray-200 text-gray-400' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
                    {followed.has(c.id) ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="font-extrabold text-[13.5px] mb-3">Why create a page?</div>
            {['Find creators that match your brand', 'Post deals and open roles', 'Build your creator community', 'Track applications in one place'].map((t, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-accent font-bold text-sm mt-0.5">✓</span>
                <span className="text-[12.5px] text-gray-600">{t}</span>
              </div>
            ))}
            <button onClick={() => setShowCreate(true)} className="w-full h-9 bg-accent hover:bg-accent-dk text-white font-bold text-[13px] rounded-full mt-2 transition">Create Company Page</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="font-extrabold text-[13px] mb-3">Companies You Follow</div>
            {followed.size === 0 ? (
              <div className="text-[12px] text-gray-400 text-center py-3">Follow companies to see them here</div>
            ) : (
              [...followed].map(id => {
                const c = companies.find(x => x.id === id)
                if (!c) return null
                return (
                  <div key={id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span>{c.logo}</span>
                    <div className="flex-1">
                      <div className="text-[12.5px] font-semibold">{c.name}</div>
                      <div className="text-[10.5px] text-gray-400">{c.industry}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>
      </div>

      {/* Create Company modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[17px] font-extrabold">Create Company Page</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-xl hover:text-gray-700">✕</button>
            </div>
            <p className="text-[12.5px] text-gray-400 mb-5">Free — connect with thousands of streamers</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Company Name *</label>
                <input type="text" placeholder="e.g. RedBull Gaming"
                  className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                  value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Industry *</label>
                <select className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                  value={createForm.industry} onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}>
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Website</label>
                <input type="url" placeholder="https://yourcompany.com"
                  className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                  value={createForm.website} onChange={e => setCreateForm({ ...createForm, website: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Tell creators about your brand and what you're looking for…"
                  className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none"
                  value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-2">Partnership Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNERSHIP_TYPES.map(pt => (
                    <button key={pt} type="button" onClick={() => togglePartnerType(pt)}
                      className={`py-2 px-3 rounded-xl border text-[11.5px] font-bold text-left transition
                        ${createForm.looking_for.includes(pt) ? 'border-accent bg-accent-lt text-accent' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 bg-green-50 border border-green-200 rounded-xl text-[12px] text-green-700 font-semibold">
              ✅ Free tier — unlimited creator connections
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleCreate} disabled={!createForm.name.trim() || !createForm.industry || creating}
                className="flex-1 h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
                {creating ? 'Creating…' : 'Create Page →'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-500 hover:border-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

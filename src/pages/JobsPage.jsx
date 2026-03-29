import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

const JOB_TYPES = ['All', 'Sponsored Stream', 'Ambassador', 'Full Time', 'Contract', 'Event']
const PLATFORMS = ['All', 'Twitch', 'Kick', 'YouTube', 'Multi-Platform']

// Seed jobs for when DB is empty
const SEED_JOBS = [
  { id: 'seed-1', title: 'Brand Ambassador — Gaming Peripherals', company_id: null, job_type: 'Ambassador', platform: 'Multi-Platform', pay_min: 2000, pay_max: 5000, pay_period: 'month', requirements: ['10K+ followers', 'FPS/RPG content', 'Posting 3x/week'], description: 'Join our ambassador team and represent our premium gaming peripherals. You\'ll receive free products, a monthly retainer, and commission on referrals. We\'re looking for passionate gamers who genuinely love quality gear.', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), company_name: 'SteelSeries', company_logo: '🎧' },
  { id: 'seed-2', title: 'Sponsored Stream Series — Energy Drink', company_id: null, job_type: 'Sponsored Stream', platform: 'Twitch', pay_min: 1500, pay_max: 2500, pay_period: 'stream', requirements: ['5K+ avg viewers', 'English speaking', '18+ audience'], description: 'We\'re looking for high-energy streamers for a 4-part sponsored stream series. Each stream should integrate our product naturally into your content. Brand guidelines and talking points provided.', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), company_name: 'RedBull Gaming', company_logo: '🐂' },
  { id: 'seed-3', title: 'Content Creator — Esports Org', company_id: null, job_type: 'Full Time', platform: 'Multi-Platform', pay_min: 40000, pay_max: 70000, pay_period: 'year', requirements: ['2+ years streaming', 'Competitive gaming exp', 'Content strategy skills'], description: 'Join our esports organization as a full-time content creator. You\'ll create daily content, represent our team at events, and help grow our community. Benefits include salary, equipment budget, and travel to tournaments.', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), company_name: 'G2 Esports', company_logo: '🏆' },
  { id: 'seed-4', title: 'YouTube Integration — PC Components', company_id: null, job_type: 'Contract', platform: 'YouTube', pay_min: 800, pay_max: 1200, pay_period: 'stream', requirements: ['50K+ YouTube subscribers', 'Tech/gaming content', 'Setup tour style videos'], description: 'We\'re looking for YouTubers to feature our new GPU line in setup videos, PC building content, and benchmark reviews. One-time payment per video with possibility of ongoing partnership.', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), company_name: 'ASUS ROG', company_logo: '🖥️' },
  { id: 'seed-5', title: 'Kick Exclusive Creator Program', company_id: null, job_type: 'Ambassador', platform: 'Kick', pay_min: 3000, pay_max: 8000, pay_period: 'month', requirements: ['Move to Kick platform', '1K+ concurrent viewers', 'Daily streaming schedule'], description: 'Kick is looking for top Twitch streamers to make the move. We offer competitive rev share, subscriber bonuses, and platform promotion. This is an exclusive long-term partnership opportunity.', created_at: new Date(Date.now() - 86400000).toISOString(), company_name: 'Kick', company_logo: '🟢' },
  { id: 'seed-6', title: 'Event Coverage — Gaming Convention', company_id: null, job_type: 'Event', platform: 'Multi-Platform', pay_min: 2000, pay_max: 4000, pay_period: 'event', requirements: ['Portable streaming setup', 'Live interview skills', 'Available June 14–16'], description: 'Cover our gaming convention from the floor! You\'ll conduct player interviews, stream tournament matches, and provide behind-the-scenes content. Travel and accommodation covered.', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), company_name: 'ESL Gaming', company_logo: '🎮' },
]

export default function JobsPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [jobs, setJobs] = useState([])
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [showApply, setShowApply] = useState(false)
  const [applyForm, setApplyForm] = useState({ message: '', media_kit_url: '' })
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(new Set())

  const fetchJobs = async () => {
    const { data, error } = await supabase.from('jobs').select('*, company:profiles!jobs_company_id_fkey(display_name, handle)').eq('is_active', true).order('created_at', { ascending: false })
    const dbJobs = data || []
    const allJobs = dbJobs.length > 0 ? dbJobs : SEED_JOBS
    setJobs(allJobs)
    if (allJobs.length > 0) setSelected(allJobs[0])
  }

  const handleApply = async () => {
    if (!selected) return
    setApplying(true)
    if (selected.id.startsWith('seed-')) {
      // Demo mode
      setTimeout(() => {
        setApplied(s => new Set([...s, selected.id]))
        showToast('🎉 Application submitted!')
        setShowApply(false)
        setApplyForm({ message: '', media_kit_url: '' })
        setApplying(false)
      }, 800)
      return
    }
    const { error } = await supabase.from('job_applications').insert({
      job_id: selected.id,
      applicant_id: profile.id,
      message: applyForm.message,
      media_kit_url: applyForm.media_kit_url,
    })
    if (error) showToast(error.message, 'error')
    else {
      setApplied(s => new Set([...s, selected.id]))
      showToast('🎉 Application submitted!')
      setShowApply(false)
      setApplyForm({ message: '', media_kit_url: '' })
    }
    setApplying(false)
  }

  useEffect(() => { fetchJobs() }, [])

  const filtered = jobs.filter(j => {
    const typeMatch = typeFilter === 'All' || j.job_type === typeFilter
    const platMatch = platformFilter === 'All' || j.platform === platformFilter || (platformFilter === 'Multi-Platform' && j.platform === 'Multi-Platform')
    return typeMatch && platMatch
  })

  const payDisplay = (job) => {
    if (!job.pay_min) return 'Negotiable'
    const min = job.pay_min >= 1000 ? `$${(job.pay_min/1000).toFixed(0)}K` : `$${job.pay_min}`
    const max = job.pay_max >= 1000 ? `$${(job.pay_max/1000).toFixed(0)}K` : `$${job.pay_max}`
    return `${min}–${max} / ${job.pay_period}`
  }

  const typeColors = { 'Ambassador': 'bg-purple-50 text-purple-700', 'Sponsored Stream': 'bg-green-50 text-green-700', 'Full Time': 'bg-blue-50 text-blue-700', 'Contract': 'bg-orange-50 text-orange-700', 'Event': 'bg-pink-50 text-pink-700' }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
        <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mr-1">Type:</div>
        {JOB_TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${typeFilter === t ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t}</button>
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mr-1">Platform:</div>
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${platformFilter === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        {/* Jobs list */}
        <div className="space-y-2">
          {filtered.length === 0 && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">No jobs match your filters</div>}
          {filtered.map(job => (
            <div key={job.id} onClick={() => setSelected(job)}
              className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition
                ${selected?.id === job.id ? 'border-accent shadow-sm ring-1 ring-accent/20' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{job.company_logo || '🏢'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold leading-tight mb-1">{job.title}</div>
                  <div className="text-[11.5px] text-gray-500 mb-2">{job.company_name || job.company?.display_name || 'Brand Partner'}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${typeColors[job.job_type] || 'bg-gray-100 text-gray-500'}`}>{job.job_type}</span>
                    <span className="text-[11px] text-accent font-bold">{payDisplay(job)}</span>
                  </div>
                </div>
              </div>
              {applied.has(job.id) && <div className="mt-2 text-[11px] text-green-600 font-bold">✓ Applied</div>}
            </div>
          ))}
        </div>

        {/* Job detail */}
        {selected && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{selected.company_logo || '🏢'}</div>
                <div>
                  <h2 className="text-[18px] font-extrabold leading-tight mb-1">{selected.title}</h2>
                  <div className="text-[13px] text-gray-500 font-semibold">{selected.company_name || selected.company?.display_name}</div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${typeColors[selected.job_type] || 'bg-gray-100 text-gray-500'}`}>{selected.job_type}</span>
                    <span className="text-[11.5px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">💰 {payDisplay(selected)}</span>
                    <span className="text-[11.5px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">📱 {selected.platform}</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400">{formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}</div>
            </div>

            <div className="prose prose-sm max-w-none mb-5">
              <p className="text-[13.5px] text-gray-700 leading-relaxed">{selected.description}</p>
            </div>

            {selected.requirements?.length > 0 && (
              <div className="mb-5">
                <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Requirements</div>
                <ul className="space-y-1.5">
                  {selected.requirements.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700">
                      <span className="text-accent font-bold">✓</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              {applied.has(selected.id) ? (
                <div className="flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-full text-[14px]">✓ Applied Successfully</div>
              ) : (
                <button onClick={() => setShowApply(true)}
                  className="px-6 py-2.5 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-[14px] transition">Apply Now →</button>
              )}
              <button onClick={() => showToast('📋 Job link copied!')} className="px-5 py-2.5 border border-gray-200 hover:border-gray-400 text-gray-600 font-bold rounded-full text-[13px] transition">Share</button>
            </div>
          </div>
        )}
      </div>

      {/* Apply modal */}
      {showApply && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[17px] font-extrabold">Apply for Role</h3>
              <button onClick={() => setShowApply(false)} className="text-gray-400 text-xl hover:text-gray-700">✕</button>
            </div>
            <div className="text-[12.5px] text-gray-400 mb-5">{selected.title} · {selected.company_name}</div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Why are you a great fit? *</label>
                <textarea rows={4} placeholder="Tell the brand why you'd be perfect for this. Mention your audience, niche, and past collabs…"
                  className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none"
                  value={applyForm.message} onChange={e => setApplyForm({ ...applyForm, message: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Media Kit URL (optional)</label>
                <input type="url" placeholder="https://your-mediakit.com or Google Drive link"
                  className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                  value={applyForm.media_kit_url} onChange={e => setApplyForm({ ...applyForm, media_kit_url: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleApply} disabled={!applyForm.message.trim() || applying}
                className="flex-1 h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
                {applying ? 'Submitting…' : 'Submit Application →'}
              </button>
              <button onClick={() => setShowApply(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-500 hover:border-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

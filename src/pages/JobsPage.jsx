import { useState } from 'react'
import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { SkeletonJob } from '@/components/ui/Skeleton'

const JOB_TYPES = ['All', 'Sponsored Stream', 'Ambassador', 'Full Time', 'Contract', 'Event']
const PLATFORMS = ['All', 'Twitch', 'Kick', 'YouTube', 'Multi-Platform']

const SEED_JOBS = [
  { id: 'seed-1', title: 'Brand Ambassador — Gaming Peripherals', job_type: 'Ambassador', platform: 'Multi-Platform', pay_min: 2000, pay_max: 5000, pay_period: 'month', requirements: ['10K+ followers', 'FPS/RPG content', 'Posting 3x/week'], description: 'Join our ambassador team and represent our premium gaming peripherals. You\'ll receive free products, a monthly retainer, and commission on referrals.', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), company_name: 'SteelSeries', company_logo: '🎧' },
  { id: 'seed-2', title: 'Sponsored Stream Series — Energy Drink', job_type: 'Sponsored Stream', platform: 'Twitch', pay_min: 1500, pay_max: 2500, pay_period: 'stream', requirements: ['5K+ avg viewers', 'English speaking', '18+ audience'], description: 'Looking for high-energy streamers for a 4-part sponsored stream series.', created_at: new Date(Date.now() - 86400000).toISOString(), company_name: 'RedBull Gaming', company_logo: '🐂' },
  { id: 'seed-3', title: 'Content Creator — Esports Org', job_type: 'Full Time', platform: 'Multi-Platform', pay_min: 40000, pay_max: 70000, pay_period: 'year', requirements: ['2+ years streaming', 'Competitive gaming exp'], description: 'Join our esports organization as a full-time content creator.', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), company_name: 'G2 Esports', company_logo: '🏆' },
  { id: 'seed-4', title: 'YouTube Integration — PC Components', job_type: 'Contract', platform: 'YouTube', pay_min: 800, pay_max: 1200, pay_period: 'stream', requirements: ['50K+ YouTube subscribers', 'Tech/gaming content'], description: 'Feature our new GPU line in setup videos and benchmark reviews.', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), company_name: 'ASUS ROG', company_logo: '🖥️' },
  { id: 'seed-5', title: 'Kick Exclusive Creator Program', job_type: 'Ambassador', platform: 'Kick', pay_min: 3000, pay_max: 8000, pay_period: 'month', requirements: ['Move to Kick platform', '1K+ concurrent viewers'], description: 'Competitive rev share, subscriber bonuses, and platform promotion.', created_at: new Date(Date.now() - 86400000).toISOString(), company_name: 'Kick', company_logo: '🟢' },
  { id: 'seed-6', title: 'Event Coverage — Gaming Convention', job_type: 'Event', platform: 'Multi-Platform', pay_min: 2000, pay_max: 4000, pay_period: 'event', requirements: ['Portable streaming setup', 'Live interview skills'], description: 'Cover our gaming convention from the floor! Travel and accommodation covered.', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), company_name: 'ESL Gaming', company_logo: '🎮' },
]

const typeColors = { 'Ambassador': 'bg-purple-50 text-purple-700', 'Sponsored Stream': 'bg-green-50 text-green-700', 'Full Time': 'bg-blue-50 text-blue-700', 'Contract': 'bg-orange-50 text-orange-700', 'Event': 'bg-pink-50 text-pink-700' }

const payDisplay = (job) => {
  if (!job.pay_min) return 'Negotiable'
  const fmt = n => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`
  return `${fmt(job.pay_min)}–${fmt(job.pay_max)} / ${job.pay_period}`
}

export default function JobsPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [typeFilter, setTypeFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showApply, setShowApply] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(new Set())

  // SWR — cached, instant on re-visit
  const { data: dbJobs, isLoading } = useSWR('jobs', async () => {
    const { data } = await supabase.from('jobs').select('*, company:profiles!jobs_company_id_fkey(display_name)').eq('is_active', true).order('created_at', { ascending: false })
    return (data && data.length > 0) ? data : SEED_JOBS
  })

  const jobs = dbJobs || []
  const filtered = jobs.filter(j => {
    const typeMatch = typeFilter === 'All' || j.job_type === typeFilter
    const platMatch = platformFilter === 'All' || j.platform === platformFilter
    return typeMatch && platMatch
  })

  // Auto-select first job
  const displaySelected = selected || (filtered.length > 0 ? filtered[0] : null)

  const handleApply = async () => {
    if (!applyMsg.trim()) return
    setApplying(true)
    if (displaySelected.id.startsWith('seed-')) {
      setTimeout(() => {
        setApplied(s => new Set([...s, displaySelected.id]))
        showToast('🎉 Application submitted!')
        setShowApply(false); setApplyMsg(''); setApplying(false)
      }, 600)
      return
    }
    const { error } = await supabase.from('job_applications').insert({ job_id: displaySelected.id, applicant_id: profile.id, message: applyMsg })
    if (error) showToast(error.message, 'error')
    else { setApplied(s => new Set([...s, displaySelected.id])); showToast('🎉 Applied!'); setShowApply(false); setApplyMsg('') }
    setApplying(false)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type:</span>
        {JOB_TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${typeFilter === t ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t}</button>
        ))}
        <div className="w-px h-5 bg-gray-200 hidden md:block" />
        {PLATFORMS.map(p => (
          <button key={p} onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${platformFilter === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        {/* Jobs list */}
        <div className="space-y-2">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <SkeletonJob key={i} />)
            : filtered.map(job => (
              <div key={job.id} onClick={() => setSelected(job)}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition
                  ${displaySelected?.id === job.id ? 'border-accent shadow-sm ring-1 ring-accent/20' : 'border-gray-200'}`}>
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
            ))
          }
        </div>

        {/* Job detail */}
        {displaySelected && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{displaySelected.company_logo || '🏢'}</div>
                <div>
                  <h2 className="text-[18px] font-extrabold leading-tight mb-1">{displaySelected.title}</h2>
                  <div className="text-[13px] text-gray-500 font-semibold">{displaySelected.company_name || displaySelected.company?.display_name}</div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${typeColors[displaySelected.job_type] || 'bg-gray-100 text-gray-500'}`}>{displaySelected.job_type}</span>
                    <span className="text-[11.5px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">💰 {payDisplay(displaySelected)}</span>
                    <span className="text-[11.5px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">📱 {displaySelected.platform}</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 flex-shrink-0">{formatDistanceToNow(new Date(displaySelected.created_at), { addSuffix: true })}</div>
            </div>
            <p className="text-[13.5px] text-gray-700 leading-relaxed mb-5">{displaySelected.description}</p>
            {displaySelected.requirements?.length > 0 && (
              <div className="mb-5">
                <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Requirements</div>
                <ul className="space-y-1.5">
                  {displaySelected.requirements.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700"><span className="text-accent font-bold">✓</span> {r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              {applied.has(displaySelected.id)
                ? <div className="px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-full text-[14px]">✓ Applied</div>
                : <button onClick={() => setShowApply(true)} className="px-6 py-2.5 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-[14px] transition">Apply Now →</button>
              }
            </div>
          </div>
        )}
      </div>

      {/* Apply modal */}
      {showApply && displaySelected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[17px] font-extrabold">Apply for Role</h3>
              <button onClick={() => setShowApply(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <textarea rows={4} placeholder="Why are you a great fit? Mention your audience, niche, past collabs…"
              className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none mb-4"
              value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
            <button onClick={handleApply} disabled={!applyMsg.trim() || applying}
              className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
              {applying ? 'Submitting…' : 'Submit Application →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

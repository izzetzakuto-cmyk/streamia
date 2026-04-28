import { useState } from 'react'
import useSWR from 'swr'
import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { jobApi } from '@/lib/api'
import { useAppStore, useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { SkeletonJob } from '@/components/ui/Skeleton'

const JOB_TYPES = ['All', 'Sponsored Stream', 'Ambassador', 'Full Time', 'Contract', 'Event']
const PLATFORMS = ['All', 'Twitch', 'Kick', 'YouTube', 'Multi-Platform']

const typeColors = { 'Ambassador': 'bg-purple-50 text-purple-700', 'Sponsored Stream': 'bg-green-50 text-green-700', 'Full Time': 'bg-blue-50 text-blue-700', 'Contract': 'bg-orange-50 text-orange-700', 'Event': 'bg-pink-50 text-pink-700' }

const payDisplay = (job) => {
  if (!job.payMin) return 'Negotiable'
  const fmt = n => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`
  return `${fmt(job.payMin)}–${fmt(job.payMax)} / ${job.payPeriod}`
}

export default function JobsPage() {
  const { showToast } = useAppStore()
  const { user } = useAuthStore()
  const isCompany = user?.role === 'company' || user?.role === 'admin'
  const [typeFilter, setTypeFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showApply, setShowApply] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(new Set())

  // SWR — cached, instant on re-visit
  const { data: dbJobs, isLoading } = useSWR('jobs', async () => {
    const result = await jobApi.list({ isActive: true, limit: 50 })
    return result.items || []
  })

  const jobs = dbJobs || []
  const filtered = jobs.filter(j => {
    const typeMatch = typeFilter === 'All' || j.jobType === typeFilter
    const platMatch = platformFilter === 'All' || j.platform === platformFilter
    return typeMatch && platMatch
  })

  // Auto-select first job
  const displaySelected = selected || (filtered.length > 0 ? filtered[0] : null)

  const handleApply = async () => {
    if (!applyMsg.trim()) return
    setApplying(true)
    try {
      await jobApi.apply(displaySelected.id, { message: applyMsg })
      setApplied(s => new Set([...s, displaySelected.id]))
      showToast('🎉 Applied!')
      setShowApply(false); setApplyMsg('')
    } catch (err) {
      if (err.code === 'ALREADY_APPLIED') {
        setApplied(s => new Set([...s, displaySelected.id]))
        showToast('You already applied', 'error')
      } else showToast(err.message || 'Could not apply', 'error')
    }
    setApplying(false)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      {isCompany && (
        <div className="mb-3 flex justify-end">
          <Link to="/jobs/manage"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[12.5px] font-bold rounded-full transition">
            <Briefcase className="w-3.5 h-3.5" strokeWidth={2.5} />
            Manage my jobs
          </Link>
        </div>
      )}

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
            : filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <div className="text-3xl mb-2">💼</div>
                <div className="font-bold text-gray-600">No jobs posted yet</div>
                <div className="text-sm text-gray-400 mt-1">Check back soon!</div>
              </div>
            ) : filtered.map(job => (
              <div key={job.id} onClick={() => setSelected(job)}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition
                  ${displaySelected?.id === job.id ? 'border-accent shadow-sm ring-1 ring-accent/20' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">{job.company?.logoUrl ? <img src={job.company.logoUrl} alt="" className="w-8 h-8 rounded" /> : '🏢'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold leading-tight mb-1">{job.title}</div>
                    <div className="text-[11.5px] text-gray-500 mb-2">{job.company?.name || 'Brand Partner'}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {job.jobType && <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${typeColors[job.jobType] || 'bg-gray-100 text-gray-500'}`}>{job.jobType}</span>}
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
                <div className="text-4xl">{displaySelected.company?.logoUrl ? <img src={displaySelected.company.logoUrl} alt="" className="w-12 h-12 rounded" /> : '🏢'}</div>
                <div>
                  <h2 className="text-[18px] font-extrabold leading-tight mb-1">{displaySelected.title}</h2>
                  <div className="text-[13px] text-gray-500 font-semibold">{displaySelected.company?.name}</div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {displaySelected.jobType && <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${typeColors[displaySelected.jobType] || 'bg-gray-100 text-gray-500'}`}>{displaySelected.jobType}</span>}
                    <span className="text-[11.5px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">💰 {payDisplay(displaySelected)}</span>
                    {displaySelected.platform && <span className="text-[11.5px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">📱 {displaySelected.platform}</span>}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 flex-shrink-0">{formatDistanceToNow(new Date(displaySelected.createdAt), { addSuffix: true })}</div>
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

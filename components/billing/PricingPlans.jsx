'use client'
import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { planApi } from '@/lib/api-client'
import UpgradeModal from '@/components/billing/UpgradeModal'

// Dynamic pricing cards driven by the DB plan catalog (/api/plans).
export default function PricingPlans() {
  const [plans, setPlans] = useState(null)
  const [upgrade, setUpgrade] = useState(null)

  useEffect(() => {
    planApi
      .list()
      .then((r) => setPlans(r?.items ?? []))
      .catch(() => setPlans([]))
  }, [])

  if (plans === null) {
    return (
      <div className="max-w-6xl mx-auto px-6 pb-24 flex justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={2.5} />
      </div>
    )
  }
  if (plans.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 pb-24 text-center text-gray-400 text-[14px]">
        Plans are being set up — check back soon.
      </div>
    )
  }

  const fmt = (cents) => (cents % 100 ? (cents / 100).toFixed(2) : String(cents / 100))

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
      {plans.map((p) => {
        const popular = p.key === 'premium'
        return (
          <div
            key={p.key}
            className={`relative bg-white border rounded-2xl p-7 ${popular ? 'border-accent ring-2 ring-accent/20' : 'border-gray-200'}`}
          >
            {popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-accent text-white text-[10.5px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                Most popular
              </div>
            )}
            <div className="text-[14px] font-extrabold uppercase tracking-wider text-gray-500">{p.name}</div>
            {p.description && <div className="text-[12px] text-gray-400 mt-0.5">{p.description}</div>}
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-[40px] font-extrabold tracking-tight">
                {p.amountMonthly != null ? `$${fmt(p.amountMonthly)}` : '—'}
              </span>
              <span className="text-[13px] text-gray-400 font-semibold">/ month</span>
            </div>
            <button
              onClick={() => setUpgrade(p.key)}
              disabled={!p.hasMonthly}
              className={`mt-5 inline-flex items-center justify-center w-full h-11 rounded-full text-[13.5px] font-bold transition disabled:opacity-50 ${
                popular ? 'bg-streamlink hover:opacity-90 text-white' : 'border border-gray-300 text-gray-700 hover:border-gray-500'
              }`}
            >
              {!p.hasMonthly ? 'Coming soon' : p.trialDays > 0 ? `Start ${p.trialDays}-day trial` : 'Subscribe'}
            </button>
            <ul className="mt-6 space-y-2.5">
              {(p.features ?? []).map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600">
                  <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {upgrade && (
        <UpgradeModal
          plan={upgrade}
          billing="monthly"
          title="Subscribe"
          onClose={() => setUpgrade(null)}
          onSuccess={() => {
            window.location.href = '/settings?upgraded=true'
          }}
        />
      )}
    </section>
  )
}

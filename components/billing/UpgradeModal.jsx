'use client'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Loader2, Lock, X } from 'lucide-react'
import { stripeApi, subscriptionApi } from '@/lib/api-client'

// Cache the Stripe.js promise per publishable key (loadStripe should run once).
let _pk = null
let _promise = null
function getStripe(pk) {
  if (pk && pk !== _pk) {
    _pk = pk
    _promise = loadStripe(pk)
  }
  return _promise
}

/**
 * On-site subscription payment (Stripe Payment Element — no redirect).
 * The card is collected in-page and tokenized by Stripe.js; our server never
 * sees the raw card number.
 */
export default function UpgradeModal({
  plan = 'premium',
  billing = 'monthly',
  title = 'Upgrade',
  subtitle,
  onClose,
  onSuccess,
}) {
  const [phase, setPhase] = useState('loading') // loading | ready | disabled | error
  const [clientSecret, setClientSecret] = useState(null)
  const [mode, setMode] = useState('payment')
  const [pk, setPk] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cfg = await stripeApi.config()
        if (cancelled) return
        if (!cfg?.enabled || !cfg?.publishableKey) {
          setPhase('disabled')
          return
        }
        const sub = await stripeApi.subscribe({ plan, billing })
        if (cancelled) return
        if (!sub?.clientSecret) {
          setError('Could not start the payment. Please try again.')
          setPhase('error')
          return
        }
        setPk(cfg.publishableKey)
        setClientSecret(sub.clientSecret)
        setMode(sub.mode || 'payment')
        setPhase('ready')
      } catch (err) {
        if (cancelled) return
        if (err?.status === 401 || err?.code === 'AUTH_MISSING' || err?.code === 'REFRESH_FAILED') {
          const next = typeof window !== 'undefined' ? window.location.pathname : '/pricing'
          window.location.href = '/login?next=' + encodeURIComponent(next)
          return
        }
        if (err?.code === 'STRIPE_DISABLED' || err?.code === 'PRICE_MISSING') setPhase('disabled')
        else {
          setError(err?.message || 'Something went wrong.')
          setPhase('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [plan, billing])

  const stripePromise = pk ? getStripe(pk) : null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
            {subtitle ? <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {phase === 'loading' && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={2.5} />
          </div>
        )}

        {phase === 'disabled' && (
          <p className="text-sm text-gray-500 py-8 text-center">Payments aren&apos;t set up yet. Check back soon!</p>
        )}

        {phase === 'error' && <p className="text-sm text-red-600 py-8 text-center">{error}</p>}

        {phase === 'ready' && clientSecret && stripePromise && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#7C5CFC', borderRadius: '10px' } },
            }}
          >
            <PaymentForm mode={mode} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        )}
      </div>
    </div>
  )
}

function PaymentForm({ mode, onSuccess, onClose }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setErr('')

    const confirm =
      mode === 'setup'
        ? stripe.confirmSetup({ elements, confirmParams: { return_url: window.location.href }, redirect: 'if_required' })
        : stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.href }, redirect: 'if_required' })

    const { error } = await confirm
    if (error) {
      setErr(error.message || 'Payment could not be completed.')
      setSubmitting(false)
      return
    }

    // Entitlement is granted asynchronously by the Stripe webhook — poll until live.
    for (let i = 0; i < 12; i++) {
      try {
        const me = await subscriptionApi.me()
        if (me?.plan && me.plan !== 'free') break
      } catch {
        /* keep polling */
      }
      await new Promise((r) => setTimeout(r, 1500))
    }

    setSubmitting(false)
    onSuccess?.()
    onClose?.()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'setup' ? 'Start free trial' : 'Subscribe'}
      </button>
      <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Secured by Stripe · your card never touches our servers
      </p>
    </form>
  )
}

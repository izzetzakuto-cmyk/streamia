'use client'
import { useState } from 'react'
import UpgradeModal from '@/components/billing/UpgradeModal'

// Interactive pricing CTA: opens the on-site Payment Element instead of
// linking away. UpgradeModal itself redirects logged-out users to /login,
// so this works for both signed-in and signed-out visitors.
export default function UpgradeCta({ plan = 'premium', className = '', children }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <UpgradeModal
          plan={plan}
          title="Subscribe"
          onClose={() => setOpen(false)}
          onSuccess={() => { window.location.href = '/settings?upgraded=true' }}
        />
      )}
    </>
  )
}

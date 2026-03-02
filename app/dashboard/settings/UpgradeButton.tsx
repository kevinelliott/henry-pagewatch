'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function UpgradeButton({ planKey, planName, priceId }: { planKey: string; planName: string; priceId: string }) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan: planKey }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      Upgrade to {planName}
    </button>
  )
}

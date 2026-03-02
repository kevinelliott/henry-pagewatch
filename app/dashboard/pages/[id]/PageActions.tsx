'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pause, Play, Trash2, MoreVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MonitoredPage } from '@/lib/types'

export default function PageActions({ page }: { page: MonitoredPage }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('monitored_pages').update({
      status: page.status === 'active' ? 'paused' : 'active'
    }).eq('id', page.id)
    setLoading(false)
    router.refresh()
  }

  const remove = async () => {
    if (!confirm('Delete this page? All change history will be lost.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('monitored_pages').delete().eq('id', page.id)
    router.push('/dashboard')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 bg-white rounded-xl shadow-lg border border-slate-200 py-1 w-44">
            <button
              onClick={() => { setOpen(false); toggle() }}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {page.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {page.status === 'active' ? 'Pause monitoring' : 'Resume monitoring'}
            </button>
            <button
              onClick={() => { setOpen(false); remove() }}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete page
            </button>
          </div>
        </>
      )}
    </div>
  )
}

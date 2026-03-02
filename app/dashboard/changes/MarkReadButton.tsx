'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MarkReadButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const markAllRead = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user's page IDs
    const { data: pages } = await supabase.from('monitored_pages').select('id').eq('user_id', user.id)
    const pageIds = pages?.map(p => p.id) || []

    if (pageIds.length > 0) {
      await supabase.from('page_changes').update({ status: 'read' }).in('page_id', pageIds).eq('status', 'unread')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={markAllRead}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
    >
      <CheckCheck className="h-4 w-4" />
      Mark all read
    </button>
  )
}

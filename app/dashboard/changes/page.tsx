import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import MarkReadButton from './MarkReadButton'

export default async function ChangesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: changes } = await supabase
    .from('page_changes')
    .select('*, page:monitored_pages!inner(id, name, url, user_id)')
    .eq('monitored_pages.user_id', user!.id)
    .order('detected_at', { ascending: false })
    .limit(50)

  const unreadCount = changes?.filter(c => c.status === 'unread').length || 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Changes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread change${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && <MarkReadButton />}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!changes || changes.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-700 mb-1">No changes detected yet</h3>
            <p className="text-sm text-slate-500">Add pages to monitor and changes will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {changes.map((change) => (
              <div key={change.id} className={`px-6 py-4 flex items-center justify-between ${change.status === 'unread' ? 'bg-amber-50/50' : ''}`}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${change.status === 'unread' ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/pages/${(change as any).page?.id}`} className="font-medium text-slate-900 text-sm hover:text-violet-600">
                        {(change as any).page?.name}
                      </Link>
                      <a href={(change as any).page?.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{change.diff_summary || 'Content changed'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+{change.lines_added}</span>
                      <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">-{change.lines_removed}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400 flex-shrink-0 ml-4">
                  {formatDateTime(change.detected_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

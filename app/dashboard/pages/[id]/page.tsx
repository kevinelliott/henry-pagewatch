import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Clock, AlertCircle, CheckCircle, Pause, Play, Trash2 } from 'lucide-react'
import { formatDateTime, timeAgo } from '@/lib/utils'
import PageActions from './PageActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PageDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: page } = await supabase
    .from('monitored_pages')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!page) notFound()

  const { data: changes } = await supabase
    .from('page_changes')
    .select('*, new_snap:page_snapshots!new_snapshot_id(content_text, content_length), old_snap:page_snapshots!old_snapshot_id(content_text, content_length)')
    .eq('page_id', id)
    .order('detected_at', { ascending: false })
    .limit(20)

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Page header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${
                page.status === 'active' ? 'bg-emerald-500' :
                page.status === 'error' ? 'bg-red-500' : 'bg-slate-300'
              }`}></div>
              <h1 className="text-xl font-bold text-slate-900">{page.name}</h1>
            </div>
            <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {page.url}
            </a>
          </div>
          <PageActions page={page} />
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          {[
            { label: 'Frequency', value: page.check_frequency, icon: Clock },
            { label: 'Checks run', value: page.check_count.toString(), icon: CheckCircle },
            { label: 'Changes found', value: page.change_count.toString(), icon: AlertCircle },
            { label: 'Last checked', value: page.last_checked_at ? timeAgo(page.last_checked_at) : 'Never', icon: Clock },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
              <p className="font-semibold text-slate-900 capitalize">{item.value}</p>
            </div>
          ))}
        </div>

        {page.status === 'error' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {page.error_message}
          </div>
        )}
      </div>

      {/* Change history */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Change history</h2>
          <p className="text-xs text-slate-500 mt-0.5">{changes?.length || 0} change{changes?.length !== 1 ? 's' : ''} detected</p>
        </div>

        {!changes || changes.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-700 mb-1">No changes detected yet</h3>
            <p className="text-sm text-slate-500">We&apos;ll notify you the moment this page changes.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {changes.map((change) => (
              <div key={change.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      change.status === 'unread' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {change.status === 'unread' ? 'New' : 'Read'}
                    </span>
                    <span className="text-sm font-medium text-slate-900">{change.diff_summary || 'Content changed'}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(change.detected_at)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">+{change.lines_added} words added</span>
                  </div>
                  <div>
                    <span className="font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded">-{change.lines_removed} words removed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

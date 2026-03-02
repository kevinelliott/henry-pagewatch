import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Globe, AlertCircle, CheckCircle, Clock, TrendingUp, Bell } from 'lucide-react'
import { timeAgo, getDomain } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: pages }, { data: changes }, { data: profile }] = await Promise.all([
    supabase.from('monitored_pages').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('page_changes').select('*, page:monitored_pages(name, url)').eq('status', 'unread').order('detected_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
  ])

  const activePages = pages?.filter(p => p.status === 'active').length || 0
  const errorPages = pages?.filter(p => p.status === 'error').length || 0
  const unreadChanges = changes?.length || 0
  const pagesLimit = profile?.pages_limit || 3

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and track page changes</p>
        </div>
        <Link href="/dashboard/pages/new" className="flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-violet-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Monitored pages', value: pages?.length || 0, sub: `of ${pagesLimit} allowed`, icon: Globe, color: 'text-violet-600 bg-violet-50' },
          { label: 'Active monitors', value: activePages, sub: 'currently running', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Unread changes', value: unreadChanges, sub: 'need your review', icon: Bell, color: 'text-amber-600 bg-amber-50' },
          { label: 'Errors', value: errorPages, sub: 'need attention', icon: AlertCircle, color: 'text-red-600 bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${stat.color}`}>
              <stat.icon className="h-4.5 w-4.5 h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent changes */}
      {unreadChanges > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-amber-900 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {unreadChanges} new change{unreadChanges !== 1 ? 's' : ''} detected
            </h2>
            <Link href="/dashboard/changes" className="text-sm text-amber-700 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {changes?.slice(0, 3).map((change) => (
              <div key={change.id} className="bg-white rounded-lg px-4 py-2.5 flex items-center justify-between border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{(change as any).page?.name}</p>
                  <p className="text-xs text-slate-500">{change.diff_summary}</p>
                </div>
                <span className="text-xs text-slate-400">{timeAgo(change.detected_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pages list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Monitored pages</h2>
          <span className="text-sm text-slate-500">{pages?.length || 0} / {pagesLimit} pages</span>
        </div>

        {!pages || pages.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-700 mb-1">No pages monitored yet</h3>
            <p className="text-sm text-slate-500 mb-4">Add your first page to start tracking changes.</p>
            <Link href="/dashboard/pages/new" className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-violet-700">
              <Plus className="h-4 w-4" />
              Add your first page
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pages.map((page) => (
              <div key={page.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    page.status === 'active' ? 'bg-emerald-500' :
                    page.status === 'error' ? 'bg-red-500' : 'bg-slate-300'
                  }`}></div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{page.name}</p>
                    <p className="text-xs text-slate-500 truncate">{getDomain(page.url)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-500 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="capitalize">{page.check_frequency}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{page.change_count} change{page.change_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs">{page.last_checked_at ? `Checked ${timeAgo(page.last_checked_at)}` : 'Never checked'}</p>
                    {page.status === 'error' && (
                      <p className="text-xs text-red-500">{page.error_message}</p>
                    )}
                  </div>
                  <Link href={`/dashboard/pages/${page.id}`} className="text-xs font-medium text-violet-600 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

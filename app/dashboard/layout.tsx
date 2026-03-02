import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, LayoutDashboard, Globe, Bell, Settings, LogOut, Plus } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-violet-600" />
            <span className="font-bold text-lg text-slate-900">PageWatch</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/pages/new" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Plus className="h-4 w-4" />
            Add Page
          </Link>
          <Link href="/dashboard/changes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Bell className="h-4 w-4" />
            Changes
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        {/* Plan badge + user */}
        <div className="p-4 border-t border-slate-100">
          <div className="mb-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              profile?.plan === 'free' ? 'bg-slate-100 text-slate-600' :
              profile?.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
              profile?.plan === 'pro' ? 'bg-violet-100 text-violet-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {profile?.plan?.toUpperCase() || 'FREE'} PLAN
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <form action={signOut}>
              <button type="submit" className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

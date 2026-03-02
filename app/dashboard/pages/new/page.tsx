'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Frequency = 'hourly' | 'daily' | 'weekly'

export default function AddPagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    url: '',
    name: '',
    check_frequency: 'daily' as Frequency,
    css_selector: '',
  })

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    // Check plan limit
    const { count } = await supabase
      .from('monitored_pages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { data: profile } = await supabase.from('profiles').select('pages_limit').eq('id', user.id).single()
    if ((count || 0) >= (profile?.pages_limit || 3)) {
      setError(`You've reached your plan limit of ${profile?.pages_limit || 3} pages. Please upgrade to add more.`)
      setLoading(false)
      return
    }

    // Normalize URL
    let url = form.url.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const { error: insertError } = await supabase.from('monitored_pages').insert({
      user_id: user.id,
      url,
      name: form.name || new URL(url).hostname,
      check_frequency: form.check_frequency,
      css_selector: form.css_selector || null,
      status: 'active',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add a page to monitor</h1>
        <p className="text-slate-500 text-sm mt-1">We&apos;ll check this page on your chosen schedule and alert you when it changes.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Page URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={form.url}
                onChange={e => update('url', e.target.value)}
                required
                placeholder="https://competitor.com/pricing"
                className="w-full pl-9 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Must be a publicly accessible URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name (optional)</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Competitor Pricing Page"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-slate-400 mt-1">A friendly name to identify this page in your dashboard</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Check frequency</label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'hourly', label: 'Hourly', desc: 'Pro+' },
                { value: 'daily', label: 'Daily', desc: 'All plans' },
                { value: 'weekly', label: 'Weekly', desc: 'All plans' },
              ] as { value: Frequency; label: string; desc: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('check_frequency', opt.value)}
                  className={`border rounded-lg p-3 text-left transition-colors ${
                    form.check_frequency === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              CSS selector <span className="text-slate-400 text-xs font-normal">(optional, Pro+)</span>
            </label>
            <input
              type="text"
              value={form.css_selector}
              onChange={e => update('css_selector', e.target.value)}
              placeholder=".pricing-table, #main-content"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-slate-400 mt-1">Only monitor a specific section of the page. Leave blank to monitor the full page.</p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Adding...' : 'Start monitoring'}
            </button>
            <Link href="/dashboard" className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

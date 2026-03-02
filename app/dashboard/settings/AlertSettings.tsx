'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Mail, Webhook } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { AlertConfig } from '@/lib/types'

export default function AlertSettings({ userId, alerts }: { userId: string; alerts: AlertConfig[] }) {
  const router = useRouter()
  const [type, setType] = useState<'email' | 'webhook'>('email')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addAlert = async () => {
    if (!value.trim()) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('alert_configs').insert({
      user_id: userId,
      type,
      email: type === 'email' ? value.trim() : null,
      webhook_url: type === 'webhook' ? value.trim() : null,
      is_active: true,
    })
    if (err) setError(err.message)
    else { setValue(''); router.refresh() }
    setLoading(false)
  }

  const deleteAlert = async (id: string) => {
    const supabase = createClient()
    await supabase.from('alert_configs').delete().eq('id', id)
    router.refresh()
  }

  const emailAlerts = alerts.filter(a => a.type === 'email')
  const webhookAlerts = alerts.filter(a => a.type === 'webhook')

  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">
        Get notified when pages change. Alerts apply to all monitored pages.
      </p>

      {/* Existing alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                {alert.type === 'email' ? <Mail className="h-3.5 w-3.5 text-slate-400" /> : <Webhook className="h-3.5 w-3.5 text-slate-400" />}
                <span className="text-sm text-slate-700">{alert.email || alert.webhook_url}</span>
                <span className="text-xs text-slate-400 capitalize">({alert.type})</span>
              </div>
              <button onClick={() => deleteAlert(alert.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new alert */}
      <div className="flex gap-2">
        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setType('email')}
            className={`px-3 py-2 text-xs font-medium flex items-center gap-1 ${type === 'email' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Mail className="h-3 w-3" />Email
          </button>
          <button
            onClick={() => setType('webhook')}
            className={`px-3 py-2 text-xs font-medium flex items-center gap-1 ${type === 'webhook' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Webhook className="h-3 w-3" />Webhook
          </button>
        </div>
        <input
          type={type === 'email' ? 'email' : 'url'}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={type === 'email' ? 'you@company.com' : 'https://hooks.slack.com/...'}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          onKeyDown={e => e.key === 'Enter' && addAlert()}
        />
        <button
          onClick={addAlert}
          disabled={loading}
          className="flex items-center gap-1.5 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}

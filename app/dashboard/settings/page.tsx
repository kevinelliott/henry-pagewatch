import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Check, Zap, CreditCard, Bell, User } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import AlertSettings from './AlertSettings'
import UpgradeButton from './UpgradeButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: alerts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('alert_configs').select('*').eq('user_id', user!.id),
  ])

  const currentPlan = profile?.plan || 'free'

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account, alerts, and subscription</p>
      </div>

      {/* Account */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Account</h2>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Email</p>
            <p className="text-sm font-medium text-slate-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Name</p>
            <p className="text-sm font-medium text-slate-900">{profile?.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pages used</p>
            <p className="text-sm font-medium text-slate-900">{profile?.pages_limit || 3} page limit</p>
          </div>
        </div>
      </section>

      {/* Alert settings */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Alert notifications</h2>
        </div>
        <AlertSettings userId={user!.id} alerts={alerts || []} />
      </section>

      {/* Billing */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Subscription</h2>
        </div>

        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            Current plan: <span className="font-semibold text-slate-900 capitalize">{currentPlan}</span>
            {currentPlan === 'free' && <span className="text-slate-500"> (3 pages, daily checks)</span>}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} className={`border rounded-xl p-4 ${currentPlan === key ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}>
              {currentPlan === key && (
                <div className="text-xs text-violet-600 font-semibold mb-1">CURRENT PLAN</div>
              )}
              <h3 className="font-bold text-slate-900">{plan.name}</h3>
              <div className="my-2">
                <span className="text-2xl font-bold text-slate-900">${plan.price}</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              <ul className="space-y-1 mb-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-violet-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {currentPlan !== key && (
                <UpgradeButton planKey={key} planName={plan.name} priceId={plan.priceId} />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

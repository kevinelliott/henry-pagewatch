import Link from 'next/link'
import { Eye, Bell, Clock, Shield, ArrowRight, Check, Zap, Globe, BarChart2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-violet-600" />
            <span className="font-bold text-xl text-slate-900">PageWatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Log in
            </Link>
            <Link href="/auth/signup" className="bg-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap className="h-3.5 w-3.5" />
          Instant alerts when anything changes
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Know the moment your
          <span className="text-violet-600"> competitors change</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          PageWatch monitors any website for content changes and alerts you instantly.
          Track competitor pricing, job posts, regulatory updates, or any page that matters.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="bg-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2 text-lg shadow-lg shadow-violet-200">
            Start monitoring free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/auth/login" className="text-slate-600 font-medium px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">No credit card required &bull; 3 pages free forever</p>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
          <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-400 text-xs font-mono">pagewatch.app/dashboard</span>
          </div>
          <div className="p-6 space-y-3">
            {[
              { name: 'Stripe Pricing Page', url: 'stripe.com/pricing', status: 'changed', time: '2 min ago', badge: 'bg-amber-500' },
              { name: 'Competitor Careers', url: 'acme.com/careers', status: 'changed', time: '1 hour ago', badge: 'bg-amber-500' },
              { name: 'AWS Status Page', url: 'status.aws.amazon.com', status: 'ok', time: '15 min ago', badge: 'bg-emerald-500' },
              { name: 'HN Front Page', url: 'news.ycombinator.com', status: 'ok', time: '5 min ago', badge: 'bg-emerald-500' },
            ].map((page) => (
              <div key={page.name} className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${page.badge}`}></div>
                  <div>
                    <p className="text-slate-100 text-sm font-medium">{page.name}</p>
                    <p className="text-slate-400 text-xs">{page.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${page.status === 'changed' ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                    {page.status === 'changed' ? 'Changed!' : 'No change'}
                  </span>
                  <p className="text-slate-500 text-xs mt-1">{page.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Built for competitive intelligence
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">
            Stop manually refreshing pages. PageWatch does the watching so you can focus on acting.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bell,
                title: 'Instant alerts',
                desc: 'Get email or webhook notifications the moment a page changes. Never miss a competitor move again.',
              },
              {
                icon: BarChart2,
                title: 'Visual diffs',
                desc: 'See exactly what changed with word-level diffs. Quickly spot price changes, new hires, or updated terms.',
              },
              {
                icon: Clock,
                title: 'Flexible scheduling',
                desc: 'Check pages hourly, daily, or weekly. Scale monitoring to match how quickly things change.',
              },
              {
                icon: Globe,
                title: 'Any public URL',
                desc: 'Monitor competitor pricing, job boards, documentation, status pages, or any publicly accessible URL.',
              },
              {
                icon: Shield,
                title: 'Reliable & fast',
                desc: 'Checks run from our servers with automatic retries. 99.9% uptime SLA on Pro and Business plans.',
              },
              {
                icon: Zap,
                title: 'Webhook support',
                desc: 'Pipe change events directly into Slack, Discord, Zapier, or any custom workflow with webhooks.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <div className="bg-violet-50 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Who uses PageWatch</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { emoji: '🏢', title: 'Sales teams', desc: 'Track competitor pricing pages and know instantly when they change rates so you can adjust your pitch.' },
            { emoji: '📊', title: 'Product managers', desc: 'Monitor competitor feature pages, changelogs, and release notes to stay ahead of the market.' },
            { emoji: '⚖️', title: 'Compliance teams', desc: 'Watch regulatory docs, legal pages, and terms of service for updates that impact your business.' },
            { emoji: '🔍', title: 'SEO professionals', desc: 'Track competitor content changes and monitor which pages they update most frequently.' },
          ].map((uc) => (
            <div key={uc.title} className="flex gap-4 p-6 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-3xl">{uc.emoji}</span>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{uc.title}</h3>
                <p className="text-slate-600 text-sm">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8" id="pricing">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-600 text-center mb-12">Start free, upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: 29,
                features: ['10 monitored pages', 'Daily checks', 'Email alerts', '30-day history'],
                cta: 'Get started',
                highlighted: false,
              },
              {
                name: 'Pro',
                price: 79,
                features: ['50 monitored pages', 'Hourly checks', 'Email + webhooks', '90-day history', 'CSS selector filtering'],
                cta: 'Get Pro',
                highlighted: true,
              },
              {
                name: 'Business',
                price: 199,
                features: ['200 monitored pages', 'Hourly checks', 'All alert types', '1-year history', 'API access', 'Priority support'],
                cta: 'Get Business',
                highlighted: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 ${plan.highlighted ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 scale-105' : 'bg-white border border-slate-200'}`}>
                {plan.highlighted && (
                  <div className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-2">Most popular</div>
                )}
                <h3 className={`font-bold text-xl mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>${plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-violet-200' : 'text-slate-500'}`}>/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlighted ? 'text-violet-100' : 'text-slate-600'}`}>
                      <Check className={`h-4 w-4 flex-shrink-0 ${plan.highlighted ? 'text-violet-200' : 'text-violet-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${plan.highlighted ? 'bg-white text-violet-600 hover:bg-violet-50' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">All plans include 3 pages free. No credit card required to start.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Start watching what matters</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">Join companies using PageWatch to stay ahead of the competition with real-time change alerts.</p>
        <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-violet-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-violet-700 transition-colors text-lg shadow-lg shadow-violet-200">
          Start monitoring free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-violet-600" />
            <span className="font-bold text-slate-900">PageWatch</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 PageWatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

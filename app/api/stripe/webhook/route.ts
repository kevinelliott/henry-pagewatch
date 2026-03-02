import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const PLAN_LIMITS: Record<string, { pages: number }> = {
  starter: { pages: 10 },
  pro: { pages: 50 },
  business: { pages: 200 },
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    if (userId && plan && PLAN_LIMITS[plan]) {
      await supabase.from('profiles').update({
        plan,
        pages_limit: PLAN_LIMITS[plan].pages,
        stripe_subscription_id: session.subscription,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    await supabase.from('profiles').update({
      plan: 'free',
      pages_limit: 3,
      stripe_subscription_id: null,
    }).eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}

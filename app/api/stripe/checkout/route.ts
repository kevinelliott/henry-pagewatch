import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId, plan } = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://henry-pagewatch.vercel.app'

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  const stripe = getStripe()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?success=true`,
    cancel_url: `${appUrl}/dashboard/settings`,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}

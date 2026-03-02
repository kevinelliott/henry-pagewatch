import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder', {
      apiVersion: '2026-02-25.clover',
    })
  }
  return stripeInstance
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    pages: 10,
    checkFrequency: 'daily',
    features: ['10 monitored pages', 'Daily checks', 'Email alerts', '30-day history'],
  },
  pro: {
    name: 'Pro',
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    pages: 50,
    checkFrequency: 'hourly',
    features: ['50 monitored pages', 'Hourly checks', 'Email + webhook alerts', '90-day history', 'CSS selector filtering'],
  },
  business: {
    name: 'Business',
    price: 199,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business',
    pages: 200,
    checkFrequency: 'hourly',
    features: ['200 monitored pages', 'Hourly checks', 'All alert types', '1-year history', 'API access', 'Priority support'],
  },
}

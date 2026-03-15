import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const courseSlug = session.metadata?.courseSlug

    if (!userId || !courseSlug) {
      return NextResponse.json({ received: true })
    }

    const existing = await prisma.purchase.findUnique({
      where: { stripeSessionId: session.id },
    })
    if (existing) {
      return NextResponse.json({ received: true })
    }

    await prisma.purchase.create({
      data: {
        userId,
        courseSlug,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null,
        amountPaid: session.amount_total ?? 0,
        currency: session.currency ?? 'twd',
        status: 'COMPLETED',
      },
    })
  }

  return NextResponse.json({ received: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendEmail, getPaymentFailedEmail, getWelcomeEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoiceFailed(invoice)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find customer by Stripe ID
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!customer) {
    console.error('Customer not found for Stripe ID:', customerId)
    return
  }

  // Get plan from price
  const priceId = subscription.items.data[0]?.price?.id
  const plan = await prisma.plan.findFirst({
    where: { stripePriceId: priceId },
  })

  // Create subscription record
  await prisma.subscription.create({
    data: {
      organizationId: customer.organizationId,
      customerId: customer.id,
      planId: plan?.id || '',
      status: mapStripeStatus(subscription.status),
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  // Send welcome email
  const email = getWelcomeEmail({
    customerName: customer.name,
    planName: plan?.name || 'your plan',
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  })

  await sendEmail({
    to: customer.email,
    subject: email.subject,
    html: email.html,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Update invoice status
  await prisma.invoice.updateMany({
    where: { stripeInvoiceId: invoice.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  })

  // Record payment
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  })

  if (customer) {
    await prisma.payment.create({
      data: {
        customerId: customer.id,
        stripePaymentId: invoice.payment_intent as string,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'SUCCEEDED',
        paymentMethod: 'card',
      },
    })

    // Update customer LTV
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        lifetimeValue: { increment: invoice.amount_paid / 100 },
        totalPayments: { increment: 1 },
      },
    })

    // Clear any dunning events
    await prisma.dunningEvent.updateMany({
      where: {
        customerId: customer.id,
        resolved: false,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    })
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const customer = await prisma.customer.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  })

  if (!customer) return

  // Update invoice status
  await prisma.invoice.updateMany({
    where: { stripeInvoiceId: invoice.id },
    data: { status: 'UNCOLLECTIBLE' },
  })

  // Record failed payment
  await prisma.payment.create({
    data: {
      customerId: customer.id,
      stripePaymentId: invoice.payment_intent as string,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'FAILED',
      failureReason: 'Payment declined',
    },
  })

  // Create dunning event
  await prisma.dunningEvent.create({
    data: {
      customerId: customer.id,
      eventType: 'PAYMENT_FAILED',
      dayNumber: 1,
      emailSent: true,
      emailSentAt: new Date(),
    },
  })

  // Send payment failed email
  const email = getPaymentFailedEmail({
    customerName: customer.name,
    amount: `$${(invoice.amount_due / 100).toFixed(2)}`,
    retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    updateCardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/update-payment`,
  })

  await sendEmail({
    to: customer.email,
    subject: email.subject,
    html: email.html,
  })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Handle one-time payments or subscription creation from checkout
  console.log('Checkout completed:', session.id)
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING' | 'PAUSED' {
  const statusMap: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' | 'TRIALING' | 'PAUSED'> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
    trialing: 'TRIALING',
    paused: 'PAUSED',
  }
  return statusMap[status] || 'ACTIVE'
}

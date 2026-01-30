import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createStripeCustomer } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const organizationId = req.headers.get('x-organization-id')

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
  }

  const customers = await prisma.customer.findMany({
    where: { organizationId },
    include: {
      subscriptions: {
        where: { status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
        include: { plan: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organizationId, name, email, company, phone, planId, sendInvite, trialDays } = body

    if (!organizationId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { organizationId, email },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    // Create Stripe customer
    const stripeCustomer = await createStripeCustomer({
      email,
      name,
      metadata: {
        organizationId,
        company: company || '',
      },
    })

    // Create customer in database
    const customer = await prisma.customer.create({
      data: {
        organizationId,
        name,
        email,
        phone,
        company,
        stripeCustomerId: stripeCustomer.id,
      },
    })

    // If a plan was selected, create subscription or checkout session
    if (planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      })

      if (plan?.stripePriceId) {
        // Create subscription with trial if specified
        // This would typically create a checkout session or subscription
        // For now, we'll just note that a subscription is pending
      }
    }

    // Send invite email if requested
    if (sendInvite) {
      // Send email with payment link
      console.log('Would send invite to:', email)
    }

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

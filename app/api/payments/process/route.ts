import { NextRequest, NextResponse } from 'next/server'
import { processPayment, PaymentMethod } from '@/lib/payments'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      method,
      amount,
      currency = 'USD',
      email,
      customerId,
      planName,
      description,
      metadata = {},
    } = body

    if (!method || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: method, amount, email' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const result = await processPayment(method as PaymentMethod, {
      amount,
      currency,
      customerId,
      customerEmail: email,
      description: description || planName || 'Purchase',
      metadata: {
        ...metadata,
        plan_name: planName,
        source: 'checkout',
      },
      returnUrl: `${baseUrl}/checkout/success?session={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/checkout?canceled=true`,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      paymentId: result.paymentId,
      status: result.status,
      redirectUrl: result.redirectUrl,
      clientSecret: result.metadata?.clientSecret,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment processing failed' },
      { status: 500 }
    )
  }
}

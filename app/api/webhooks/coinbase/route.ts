import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCoinbaseWebhook } from '@/lib/payments/crypto'

// Coinbase Commerce Webhook Events
type CoinbaseWebhookEvent =
  | 'charge:created'
  | 'charge:confirmed'
  | 'charge:failed'
  | 'charge:delayed'
  | 'charge:pending'
  | 'charge:resolved'

interface CoinbaseChargeData {
  id: string
  code: string
  name: string
  description: string
  pricing: {
    local: { amount: string; currency: string }
    bitcoin?: { amount: string; currency: string }
    ethereum?: { amount: string; currency: string }
    usdc?: { amount: string; currency: string }
  }
  payments: Array<{
    network: string
    transaction_id: string
    status: string
    value: { amount: string; currency: string }
  }>
  metadata: Record<string, string>
  timeline: Array<{
    time: string
    status: string
  }>
}

interface CoinbaseWebhookPayload {
  id: string
  scheduled_for: string
  event: {
    id: string
    type: CoinbaseWebhookEvent
    data: CoinbaseChargeData
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-cc-webhook-signature')

    // Verify webhook signature
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = verifyCoinbaseWebhook(body, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid Coinbase webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload: CoinbaseWebhookPayload = JSON.parse(body)
    const { event } = payload
    const charge = event.data

    console.log('Coinbase webhook received:', {
      type: event.type,
      chargeId: charge.id,
      chargeCode: charge.code,
    })

    switch (event.type) {
      case 'charge:created': {
        console.log('Crypto charge created:', charge.code)
        // Charge created, waiting for payment
        break
      }

      case 'charge:pending': {
        console.log('Crypto payment pending (detected, awaiting confirmations):', charge.code)

        // Payment detected on blockchain, waiting for confirmations
        if (charge.metadata.customer_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: charge.id },
            data: {
              status: 'PENDING',
              paymentMethod: 'crypto',
            },
          })
        }
        break
      }

      case 'charge:confirmed': {
        console.log('Crypto payment confirmed:', charge.code)

        const payment = charge.payments[0]

        // Payment confirmed on blockchain
        if (charge.metadata.customer_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: charge.id },
            data: {
              status: 'SUCCEEDED',
              paymentMethod: `crypto_${payment?.network || 'unknown'}`,
              metadata: {
                transaction_id: payment?.transaction_id,
                network: payment?.network,
                crypto_amount: payment?.value.amount,
                crypto_currency: payment?.value.currency,
              },
            },
          })

          // Activate subscription or fulfill order
          // ... your fulfillment logic here
        }
        break
      }

      case 'charge:failed': {
        console.log('Crypto payment failed:', charge.code)

        // Payment failed (expired or underpaid)
        if (charge.metadata.customer_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: charge.id },
            data: {
              status: 'FAILED',
              failureReason: 'Crypto payment expired or was underpaid',
            },
          })
        }
        break
      }

      case 'charge:delayed': {
        console.log('Crypto payment delayed:', charge.code)

        // Payment received but taking longer than expected
        // Usually means it was sent with low network fees
        break
      }

      case 'charge:resolved': {
        console.log('Crypto charge resolved:', charge.code)

        // Charge manually resolved (e.g., customer contacted support)
        const latestStatus = charge.timeline[charge.timeline.length - 1]?.status

        if (latestStatus === 'RESOLVED' && charge.metadata.customer_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: charge.id },
            data: {
              status: 'SUCCEEDED',
              paymentMethod: 'crypto_resolved',
            },
          })
        }
        break
      }

      default:
        console.log('Unhandled Coinbase event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Coinbase webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

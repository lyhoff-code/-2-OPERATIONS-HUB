import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// Square Webhook Events
type SquareWebhookEvent =
  | 'payment.completed'
  | 'payment.updated'
  | 'refund.created'
  | 'refund.updated'
  | 'subscription.created'
  | 'subscription.updated'
  | 'invoice.payment_made'
  | 'invoice.canceled'

interface SquareWebhookPayload {
  merchant_id: string
  type: SquareWebhookEvent
  event_id: string
  created_at: string
  data: {
    type: string
    id: string
    object: Record<string, unknown>
  }
}

function verifySquareSignature(
  body: string,
  signature: string,
  signatureKey: string,
  webhookUrl: string
): boolean {
  const payload = webhookUrl + body
  const expectedSignature = crypto
    .createHmac('sha256', signatureKey)
    .update(payload)
    .digest('base64')

  return signature === expectedSignature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-square-hmacsha256-signature')

    // Verify webhook signature
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    const webhookUrl = process.env.SQUARE_WEBHOOK_URL

    if (signatureKey && webhookUrl && signature) {
      const isValid = verifySquareSignature(body, signature, signatureKey, webhookUrl)
      if (!isValid) {
        console.error('Invalid Square webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload: SquareWebhookPayload = JSON.parse(body)

    console.log('Square webhook received:', {
      type: payload.type,
      eventId: payload.event_id,
    })

    switch (payload.type) {
      case 'payment.completed': {
        const payment = payload.data.object as {
          id: string
          amount_money: { amount: number; currency: string }
          status: string
          source_type: string
          customer_id?: string
          reference_id?: string
        }

        console.log('Square payment completed:', payment.id)

        // Find and update payment in database
        if (payment.reference_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: payment.id },
            data: {
              status: 'SUCCEEDED',
              paymentMethod: payment.source_type,
            },
          })
        }
        break
      }

      case 'payment.updated': {
        const payment = payload.data.object as {
          id: string
          status: string
        }

        console.log('Square payment updated:', payment.id, payment.status)

        const statusMap: Record<string, 'PENDING' | 'SUCCEEDED' | 'FAILED'> = {
          PENDING: 'PENDING',
          COMPLETED: 'SUCCEEDED',
          APPROVED: 'PENDING',
          CANCELED: 'FAILED',
          FAILED: 'FAILED',
        }

        await prisma.payment.updateMany({
          where: { stripePaymentId: payment.id },
          data: {
            status: statusMap[payment.status] || 'PENDING',
          },
        })
        break
      }

      case 'refund.created':
      case 'refund.updated': {
        const refund = payload.data.object as {
          id: string
          payment_id: string
          amount_money: { amount: number; currency: string }
          status: string
        }

        console.log('Square refund:', refund.id, refund.status)

        if (refund.status === 'COMPLETED') {
          await prisma.payment.updateMany({
            where: { stripePaymentId: refund.payment_id },
            data: {
              status: 'REFUNDED',
              refundedAmount: refund.amount_money.amount / 100,
            },
          })
        }
        break
      }

      case 'subscription.created': {
        const subscription = payload.data.object as {
          id: string
          customer_id: string
          plan_variation_id: string
          status: string
        }

        console.log('Square subscription created:', subscription.id)
        break
      }

      case 'subscription.updated': {
        const subscription = payload.data.object as {
          id: string
          status: string
        }

        console.log('Square subscription updated:', subscription.id, subscription.status)

        const statusMap: Record<string, 'ACTIVE' | 'CANCELED' | 'PAUSED'> = {
          ACTIVE: 'ACTIVE',
          CANCELED: 'CANCELED',
          DEACTIVATED: 'CANCELED',
          PAUSED: 'PAUSED',
        }

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: statusMap[subscription.status] || 'ACTIVE',
          },
        })
        break
      }

      case 'invoice.payment_made': {
        const invoice = payload.data.object as {
          id: string
          status: string
          payment_requests: Array<{
            computed_amount_money: { amount: number }
          }>
        }

        console.log('Square invoice paid:', invoice.id)

        await prisma.invoice.updateMany({
          where: { stripeInvoiceId: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })
        break
      }

      case 'invoice.canceled': {
        const invoice = payload.data.object as { id: string }

        console.log('Square invoice canceled:', invoice.id)

        await prisma.invoice.updateMany({
          where: { stripeInvoiceId: invoice.id },
          data: { status: 'VOID' },
        })
        break
      }

      default:
        console.log('Unhandled Square event:', payload.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Square webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

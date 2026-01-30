import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PayPal Webhook Events
type PayPalWebhookEvent =
  | 'PAYMENT.CAPTURE.COMPLETED'
  | 'PAYMENT.CAPTURE.DENIED'
  | 'PAYMENT.CAPTURE.REFUNDED'
  | 'BILLING.SUBSCRIPTION.CREATED'
  | 'BILLING.SUBSCRIPTION.ACTIVATED'
  | 'BILLING.SUBSCRIPTION.CANCELLED'
  | 'BILLING.SUBSCRIPTION.SUSPENDED'
  | 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'

interface PayPalWebhookPayload {
  id: string
  event_type: PayPalWebhookEvent
  resource_type: string
  resource: Record<string, unknown>
  create_time: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const payload: PayPalWebhookPayload = JSON.parse(body)

    // Verify webhook signature
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    const transmissionId = req.headers.get('paypal-transmission-id')
    const transmissionTime = req.headers.get('paypal-transmission-time')
    const certUrl = req.headers.get('paypal-cert-url')
    const authAlgo = req.headers.get('paypal-auth-algo')
    const transmissionSig = req.headers.get('paypal-transmission-sig')

    // In production, verify the webhook signature
    // For now, we'll trust the webhook
    console.log('PayPal webhook received:', {
      webhookId,
      transmissionId,
      eventType: payload.event_type,
    })

    // Handle different event types
    switch (payload.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const capture = payload.resource as {
          id: string
          amount: { value: string; currency_code: string }
          custom_id?: string
        }

        console.log('Payment captured:', capture.id, capture.amount)

        // Update payment in database
        if (capture.custom_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: capture.id },
            data: {
              status: 'SUCCEEDED',
            },
          })
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        const capture = payload.resource as { id: string; custom_id?: string }
        console.log('Payment denied:', capture.id)

        if (capture.custom_id) {
          await prisma.payment.updateMany({
            where: { stripePaymentId: capture.id },
            data: {
              status: 'FAILED',
              failureReason: 'Payment denied by PayPal',
            },
          })
        }
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const refund = payload.resource as {
          id: string
          amount: { value: string; currency_code: string }
        }
        console.log('Payment refunded:', refund.id, refund.amount)
        break
      }

      case 'BILLING.SUBSCRIPTION.CREATED': {
        const subscription = payload.resource as {
          id: string
          plan_id: string
          custom_id?: string
          status: string
        }
        console.log('Subscription created:', subscription.id)
        break
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscription = payload.resource as {
          id: string
          custom_id?: string
          status: string
        }
        console.log('Subscription activated:', subscription.id)

        // Update subscription status
        if (subscription.custom_id) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: 'ACTIVE' },
          })
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscription = payload.resource as {
          id: string
          custom_id?: string
        }
        console.log('Subscription cancelled:', subscription.id)

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELED', canceledAt: new Date() },
        })
        break
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscription = payload.resource as { id: string }
        console.log('Subscription suspended:', subscription.id)

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'PAUSED' },
        })
        break
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const subscription = payload.resource as {
          id: string
          custom_id?: string
        }
        console.log('Subscription payment failed:', subscription.id)

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'PAST_DUE' },
        })

        // Create dunning event
        // ... trigger dunning process
        break
      }

      default:
        console.log('Unhandled PayPal event:', payload.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

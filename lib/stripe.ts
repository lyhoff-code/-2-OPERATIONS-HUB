import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
})

// ============================================
// CUSTOMER OPERATIONS
// ============================================

export async function createStripeCustomer(params: {
  email: string
  name: string
  metadata?: Record<string, string>
}) {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  })
}

export async function updateStripeCustomer(
  customerId: string,
  params: Stripe.CustomerUpdateParams
) {
  return stripe.customers.update(customerId, params)
}

export async function deleteStripeCustomer(customerId: string) {
  return stripe.customers.del(customerId)
}

// ============================================
// SUBSCRIPTION OPERATIONS
// ============================================

export async function createSubscription(params: {
  customerId: string
  priceId: string
  trialDays?: number
  couponId?: string
  metadata?: Record<string, string>
}) {
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: params.metadata,
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  }

  if (params.trialDays) {
    subscriptionParams.trial_period_days = params.trialDays
  }

  if (params.couponId) {
    subscriptionParams.coupon = params.couponId
  }

  return stripe.subscriptions.create(subscriptionParams)
}

export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function pauseSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: 'void',
    },
  })
}

export async function resumeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    pause_collection: '',
  })
}

export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  })
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export async function createPaymentIntent(params: {
  amount: number
  currency: string
  customerId: string
  metadata?: Record<string, string>
}) {
  return stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100), // Convert to cents
    currency: params.currency.toLowerCase(),
    customer: params.customerId,
    metadata: params.metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  mode: 'payment' | 'subscription'
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  trialDays?: number
  couponId?: string
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: params.customerId,
    mode: params.mode,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  }

  if (params.mode === 'subscription' && params.trialDays) {
    sessionParams.subscription_data = {
      trial_period_days: params.trialDays,
    }
  }

  if (params.couponId) {
    sessionParams.discounts = [{ coupon: params.couponId }]
  }

  return stripe.checkout.sessions.create(sessionParams)
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// ============================================
// INVOICE OPERATIONS
// ============================================

export async function createInvoice(params: {
  customerId: string
  items: Array<{ description: string; amount: number; quantity: number }>
  metadata?: Record<string, string>
  autoFinalize?: boolean
}) {
  // Create invoice items first
  for (const item of params.items) {
    await stripe.invoiceItems.create({
      customer: params.customerId,
      description: item.description,
      amount: Math.round(item.amount * 100),
      quantity: item.quantity,
    })
  }

  // Create the invoice
  const invoice = await stripe.invoices.create({
    customer: params.customerId,
    metadata: params.metadata,
    auto_advance: params.autoFinalize ?? true,
  })

  return invoice
}

export async function sendInvoice(invoiceId: string) {
  return stripe.invoices.sendInvoice(invoiceId)
}

export async function voidInvoice(invoiceId: string) {
  return stripe.invoices.voidInvoice(invoiceId)
}

export async function markInvoiceUncollectible(invoiceId: string) {
  return stripe.invoices.markUncollectible(invoiceId)
}

// ============================================
// REFUND OPERATIONS
// ============================================

export async function createRefund(params: {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}) {
  return stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount ? Math.round(params.amount * 100) : undefined,
    reason: params.reason,
  })
}

// ============================================
// PRICE/PLAN OPERATIONS
// ============================================

export async function createPrice(params: {
  productName: string
  productDescription?: string
  amount: number
  currency: string
  interval?: 'month' | 'year'
  metadata?: Record<string, string>
}) {
  // Create product first
  const product = await stripe.products.create({
    name: params.productName,
    description: params.productDescription,
    metadata: params.metadata,
  })

  // Create price
  const priceParams: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: Math.round(params.amount * 100),
    currency: params.currency.toLowerCase(),
    metadata: params.metadata,
  }

  if (params.interval) {
    priceParams.recurring = { interval: params.interval }
  }

  return stripe.prices.create(priceParams)
}

// ============================================
// COUPON OPERATIONS
// ============================================

export async function createCoupon(params: {
  name: string
  percentOff?: number
  amountOff?: number
  currency?: string
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths?: number
  maxRedemptions?: number
  metadata?: Record<string, string>
}) {
  const couponParams: Stripe.CouponCreateParams = {
    name: params.name,
    duration: params.duration,
    metadata: params.metadata,
  }

  if (params.percentOff) {
    couponParams.percent_off = params.percentOff
  } else if (params.amountOff && params.currency) {
    couponParams.amount_off = Math.round(params.amountOff * 100)
    couponParams.currency = params.currency.toLowerCase()
  }

  if (params.duration === 'repeating' && params.durationInMonths) {
    couponParams.duration_in_months = params.durationInMonths
  }

  if (params.maxRedemptions) {
    couponParams.max_redemptions = params.maxRedemptions
  }

  return stripe.coupons.create(couponParams)
}

// ============================================
// WEBHOOK HELPERS
// ============================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  )
}

export type StripeWebhookEvent = Stripe.Event

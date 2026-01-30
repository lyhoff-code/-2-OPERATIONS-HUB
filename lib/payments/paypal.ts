// PayPal & Venmo Payment Provider
// Documentation: https://developer.paypal.com/

const PAYPAL_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

// ============================================
// AUTHENTICATION
// ============================================

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

async function paypalRequest(
  endpoint: string,
  method: string = 'GET',
  body?: object
) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(`${PAYPAL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return response.json()
}

// ============================================
// ORDERS (ONE-TIME PAYMENTS)
// ============================================

interface PayPalOrderParams {
  amount: number
  currency?: string
  description?: string
  customId?: string
  returnUrl: string
  cancelUrl: string
  enableVenmo?: boolean
}

export async function createPayPalOrder(params: PayPalOrderParams) {
  const {
    amount,
    currency = 'USD',
    description,
    customId,
    returnUrl,
    cancelUrl,
    enableVenmo = true,
  } = params

  const paymentSource: Record<string, unknown> = {}

  // Enable Venmo as payment option
  if (enableVenmo) {
    paymentSource.venmo = {
      experience_context: {
        brand_name: process.env.COMPANY_NAME || 'Operations Hub',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }
  }

  const order = await paypalRequest('/v2/checkout/orders', 'POST', {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description,
        custom_id: customId,
      },
    ],
    payment_source: Object.keys(paymentSource).length > 0 ? paymentSource : undefined,
    application_context: {
      brand_name: process.env.COMPANY_NAME || 'Operations Hub',
      landing_page: 'NO_PREFERENCE',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl,
      payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
    },
  })

  const approveLink = order.links?.find((l: { rel: string }) => l.rel === 'approve')?.href

  return {
    success: true,
    orderId: order.id,
    status: order.status,
    approveUrl: approveLink,
  }
}

export async function capturePayPalOrder(orderId: string) {
  const result = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, 'POST')

  return {
    success: result.status === 'COMPLETED',
    orderId: result.id,
    status: result.status,
    payerId: result.payer?.payer_id,
    payerEmail: result.payer?.email_address,
    captureId: result.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    amount: result.purchase_units?.[0]?.payments?.captures?.[0]?.amount,
  }
}

// ============================================
// VENMO SPECIFIC
// ============================================

export async function createVenmoPayment(params: PayPalOrderParams) {
  // Venmo uses the same PayPal Orders API
  // The SDK on frontend handles showing Venmo option
  return createPayPalOrder({ ...params, enableVenmo: true })
}

// ============================================
// SUBSCRIPTIONS
// ============================================

interface PayPalPlanParams {
  name: string
  description: string
  price: number
  currency?: string
  interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  intervalCount?: number
}

export async function createPayPalPlan(params: PayPalPlanParams) {
  const {
    name,
    description,
    price,
    currency = 'USD',
    interval,
    intervalCount = 1,
  } = params

  // First create a product
  const product = await paypalRequest('/v1/catalogs/products', 'POST', {
    name,
    description,
    type: 'SERVICE',
    category: 'SOFTWARE',
  })

  // Then create a billing plan
  const plan = await paypalRequest('/v1/billing/plans', 'POST', {
    product_id: product.id,
    name,
    description,
    billing_cycles: [
      {
        frequency: {
          interval_unit: interval,
          interval_count: intervalCount,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: price.toFixed(2),
            currency_code: currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  })

  return {
    success: true,
    productId: product.id,
    planId: plan.id,
  }
}

interface PayPalSubscriptionParams {
  planId: string
  customerId?: string
  returnUrl: string
  cancelUrl: string
}

export async function createPayPalSubscription(params: PayPalSubscriptionParams) {
  const { planId, customerId, returnUrl, cancelUrl } = params

  const subscription = await paypalRequest('/v1/billing/subscriptions', 'POST', {
    plan_id: planId,
    custom_id: customerId,
    application_context: {
      brand_name: process.env.COMPANY_NAME || 'Operations Hub',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  })

  const approveLink = subscription.links?.find(
    (l: { rel: string }) => l.rel === 'approve'
  )?.href

  return {
    success: true,
    subscriptionId: subscription.id,
    status: subscription.status,
    approveUrl: approveLink,
  }
}

export async function cancelPayPalSubscription(subscriptionId: string, reason?: string) {
  await paypalRequest(`/v1/billing/subscriptions/${subscriptionId}/cancel`, 'POST', {
    reason: reason || 'Customer requested cancellation',
  })

  return { success: true }
}

// ============================================
// REFUNDS
// ============================================

export async function refundPayPalPayment(
  captureId: string,
  amount?: number,
  currency: string = 'USD',
  note?: string
) {
  const body: Record<string, unknown> = {}

  if (amount) {
    body.amount = {
      value: amount.toFixed(2),
      currency_code: currency,
    }
  }

  if (note) {
    body.note_to_payer = note
  }

  const refund = await paypalRequest(
    `/v2/payments/captures/${captureId}/refund`,
    'POST',
    Object.keys(body).length > 0 ? body : undefined
  )

  return {
    success: refund.status === 'COMPLETED',
    refundId: refund.id,
    status: refund.status,
    amount: refund.amount,
  }
}

// ============================================
// PAYOUTS (Send money to users)
// ============================================

interface PayoutItem {
  email: string
  amount: number
  currency?: string
  note?: string
}

export async function createPayPalPayout(items: PayoutItem[]) {
  const payout = await paypalRequest('/v1/payments/payouts', 'POST', {
    sender_batch_header: {
      sender_batch_id: `payout_${Date.now()}`,
      email_subject: 'You have a payment',
      email_message: 'You received a payment.',
    },
    items: items.map((item, index) => ({
      recipient_type: 'EMAIL',
      amount: {
        value: item.amount.toFixed(2),
        currency: item.currency || 'USD',
      },
      receiver: item.email,
      note: item.note || 'Thank you!',
      sender_item_id: `item_${index}_${Date.now()}`,
    })),
  })

  return {
    success: true,
    batchId: payout.batch_header?.payout_batch_id,
    status: payout.batch_header?.batch_status,
  }
}

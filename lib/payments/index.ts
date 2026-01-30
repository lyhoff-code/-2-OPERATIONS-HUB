// Unified Payment Service
// Combines all payment providers into a single interface

import * as stripeLib from '@/lib/stripe'
import * as squareLib from './square'
import * as paypalLib from './paypal'
import * as cryptoLib from './crypto'

export type PaymentProvider = 'stripe' | 'square' | 'paypal' | 'venmo' | 'crypto'

export type PaymentMethod =
  | 'card'
  | 'ach'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'venmo'
  | 'klarna'
  | 'affirm'
  | 'afterpay'
  | 'crypto_btc'
  | 'crypto_eth'
  | 'crypto_usdc'

// ============================================
// UNIFIED PAYMENT INTERFACE
// ============================================

export interface PaymentRequest {
  amount: number
  currency?: string
  customerId?: string
  customerEmail: string
  customerName?: string
  description?: string
  metadata?: Record<string, string>
  returnUrl: string
  cancelUrl: string
}

export interface PaymentResult {
  success: boolean
  provider: PaymentProvider
  paymentId?: string
  status?: string
  redirectUrl?: string
  error?: string
  metadata?: Record<string, unknown>
}

// ============================================
// PROCESS PAYMENT BY METHOD
// ============================================

export async function processPayment(
  method: PaymentMethod,
  request: PaymentRequest
): Promise<PaymentResult> {
  const { amount, currency = 'USD', customerEmail, description, metadata, returnUrl, cancelUrl } = request

  try {
    switch (method) {
      // ─────────────────────────────────────
      // STRIPE METHODS
      // ─────────────────────────────────────
      case 'card':
      case 'apple_pay':
      case 'google_pay': {
        const intent = await stripeLib.createPaymentIntent({
          amount,
          currency,
          customerId: request.customerId || '',
          metadata,
        })
        return {
          success: true,
          provider: 'stripe',
          paymentId: intent.id,
          status: intent.status,
          metadata: { clientSecret: intent.client_secret },
        }
      }

      case 'ach': {
        const intent = await stripeLib.createACHPaymentIntent({
          amount,
          currency,
          customerId: request.customerId || '',
          metadata,
        })
        return {
          success: true,
          provider: 'stripe',
          paymentId: intent.id,
          status: intent.status,
          metadata: { clientSecret: intent.client_secret },
        }
      }

      case 'klarna': {
        const session = await stripeLib.createKlarnaCheckoutSession({
          customerId: request.customerId,
          customerEmail,
          lineItems: [{ name: description || 'Purchase', amount, quantity: 1 }],
          successUrl: returnUrl,
          cancelUrl,
          metadata,
        })
        return {
          success: true,
          provider: 'stripe',
          paymentId: session.id,
          status: session.status || 'created',
          redirectUrl: session.url || undefined,
        }
      }

      case 'affirm': {
        const session = await stripeLib.createAffirmCheckoutSession({
          customerId: request.customerId,
          customerEmail,
          lineItems: [{ name: description || 'Purchase', amount, quantity: 1 }],
          successUrl: returnUrl,
          cancelUrl,
          metadata,
        })
        return {
          success: true,
          provider: 'stripe',
          paymentId: session.id,
          status: session.status || 'created',
          redirectUrl: session.url || undefined,
        }
      }

      case 'afterpay': {
        const intent = await stripeLib.createAfterpayPaymentIntent({
          amount,
          currency,
          customerId: request.customerId,
          metadata,
        })
        return {
          success: true,
          provider: 'stripe',
          paymentId: intent.id,
          status: intent.status,
          metadata: { clientSecret: intent.client_secret },
        }
      }

      // ─────────────────────────────────────
      // PAYPAL / VENMO
      // ─────────────────────────────────────
      case 'paypal': {
        const order = await paypalLib.createPayPalOrder({
          amount,
          currency,
          description,
          customId: request.customerId,
          returnUrl,
          cancelUrl,
          enableVenmo: false,
        })
        return {
          success: true,
          provider: 'paypal',
          paymentId: order.orderId,
          status: order.status,
          redirectUrl: order.approveUrl,
        }
      }

      case 'venmo': {
        const order = await paypalLib.createVenmoPayment({
          amount,
          currency,
          description,
          customId: request.customerId,
          returnUrl,
          cancelUrl,
        })
        return {
          success: true,
          provider: 'venmo',
          paymentId: order.orderId,
          status: order.status,
          redirectUrl: order.approveUrl,
        }
      }

      // ─────────────────────────────────────
      // CRYPTO
      // ─────────────────────────────────────
      case 'crypto_btc':
      case 'crypto_eth':
      case 'crypto_usdc': {
        const charge = await cryptoLib.createCryptoCharge({
          name: description || 'Purchase',
          description: `Payment for ${description || 'purchase'}`,
          amount,
          currency,
          customerId: request.customerId,
          metadata,
          redirectUrl: returnUrl,
          cancelUrl,
        })
        return {
          success: true,
          provider: 'crypto',
          paymentId: charge.chargeId,
          status: 'pending',
          redirectUrl: charge.hostedUrl,
          metadata: {
            chargeCode: charge.chargeCode,
            addresses: charge.addresses,
            pricing: charge.pricing,
          },
        }
      }

      default:
        return {
          success: false,
          provider: 'stripe',
          error: `Unsupported payment method: ${method}`,
        }
    }
  } catch (error) {
    console.error(`Payment error (${method}):`, error)
    return {
      success: false,
      provider: getProviderForMethod(method),
      error: error instanceof Error ? error.message : 'Payment processing failed',
    }
  }
}

// ============================================
// AVAILABLE PAYMENT METHODS
// ============================================

export interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  icon: string
  description: string
  fee: string
  processing: string
  provider: PaymentProvider
  minAmount?: number
  maxAmount?: number
  countries?: string[]
  enabled: boolean
}

export function getAvailablePaymentMethods(params?: {
  amount?: number
  country?: string
  enabledProviders?: PaymentProvider[]
}): PaymentMethodInfo[] {
  const { amount, country = 'US', enabledProviders } = params || {}

  const allMethods: PaymentMethodInfo[] = [
    // Cards
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, Amex, Discover',
      fee: '2.9% + $0.30',
      processing: 'Instant',
      provider: 'stripe',
      enabled: true,
    },
    // ACH
    {
      id: 'ach',
      name: 'Bank Transfer (ACH)',
      icon: '🏦',
      description: 'Pay directly from your bank account',
      fee: '0.8% (max $5)',
      processing: '3-5 business days',
      provider: 'stripe',
      countries: ['US'],
      enabled: true,
    },
    // Apple Pay
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: '',
      description: 'Quick checkout with Apple Pay',
      fee: '2.9% + $0.30',
      processing: 'Instant',
      provider: 'stripe',
      enabled: true,
    },
    // Google Pay
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: '🔵',
      description: 'Quick checkout with Google Pay',
      fee: '2.9% + $0.30',
      processing: 'Instant',
      provider: 'stripe',
      enabled: true,
    },
    // PayPal
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: 'Pay with your PayPal account',
      fee: '2.9% + $0.30',
      processing: 'Instant',
      provider: 'paypal',
      enabled: true,
    },
    // Venmo
    {
      id: 'venmo',
      name: 'Venmo',
      icon: '💙',
      description: 'Pay with Venmo',
      fee: '1.9% + $0.10',
      processing: 'Instant',
      provider: 'venmo',
      countries: ['US'],
      enabled: true,
    },
    // Klarna
    {
      id: 'klarna',
      name: 'Klarna',
      icon: '🟠',
      description: 'Pay in 4 interest-free installments',
      fee: '3.29% + $0.30',
      processing: 'Instant',
      provider: 'stripe',
      enabled: true,
    },
    // Affirm
    {
      id: 'affirm',
      name: 'Affirm',
      icon: '🔷',
      description: 'Monthly payments 3-36 months',
      fee: '3.29% + $0.30',
      processing: 'Instant',
      provider: 'stripe',
      minAmount: 50,
      maxAmount: 30000,
      countries: ['US'],
      enabled: true,
    },
    // Afterpay
    {
      id: 'afterpay',
      name: 'Afterpay',
      icon: '⬛',
      description: 'Pay in 4 installments',
      fee: '3.29% + $0.30',
      processing: 'Instant',
      provider: 'stripe',
      enabled: true,
    },
    // Crypto
    {
      id: 'crypto_btc',
      name: 'Bitcoin',
      icon: '₿',
      description: 'Pay with Bitcoin',
      fee: '1%',
      processing: '10-60 minutes',
      provider: 'crypto',
      enabled: true,
    },
    {
      id: 'crypto_eth',
      name: 'Ethereum',
      icon: 'Ξ',
      description: 'Pay with Ethereum',
      fee: '1%',
      processing: '2-5 minutes',
      provider: 'crypto',
      enabled: true,
    },
    {
      id: 'crypto_usdc',
      name: 'USD Coin',
      icon: '💲',
      description: 'Pay with USDC (stablecoin)',
      fee: '1%',
      processing: '2-5 minutes',
      provider: 'crypto',
      enabled: true,
    },
  ]

  return allMethods.filter((method) => {
    // Check if provider is enabled
    if (enabledProviders && !enabledProviders.includes(method.provider)) {
      return false
    }

    // Check country restrictions
    if (method.countries && !method.countries.includes(country)) {
      return false
    }

    // Check amount restrictions
    if (amount) {
      if (method.minAmount && amount < method.minAmount) {
        return false
      }
      if (method.maxAmount && amount > method.maxAmount) {
        return false
      }
    }

    return method.enabled
  })
}

// ============================================
// HELPERS
// ============================================

function getProviderForMethod(method: PaymentMethod): PaymentProvider {
  switch (method) {
    case 'paypal':
      return 'paypal'
    case 'venmo':
      return 'venmo'
    case 'crypto_btc':
    case 'crypto_eth':
    case 'crypto_usdc':
      return 'crypto'
    default:
      return 'stripe'
  }
}

// ============================================
// REFUNDS
// ============================================

export async function processRefund(
  provider: PaymentProvider,
  paymentId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  try {
    switch (provider) {
      case 'stripe': {
        const refund = await stripeLib.createRefund({
          paymentIntentId: paymentId,
          amount,
          reason: 'requested_by_customer',
        })
        return { success: true, refundId: refund.id }
      }

      case 'square': {
        const result = await squareLib.createSquareRefund(
          paymentId,
          amount ? amount * 100 : 0,
          'USD',
          reason
        )
        return { success: result.success, refundId: result.refundId, error: result.error }
      }

      case 'paypal':
      case 'venmo': {
        const result = await paypalLib.refundPayPalPayment(paymentId, amount, 'USD', reason)
        return { success: result.success, refundId: result.refundId }
      }

      case 'crypto':
        // Crypto payments are generally non-refundable
        // Would need to process manually
        return {
          success: false,
          error: 'Crypto payments require manual refund processing',
        }

      default:
        return { success: false, error: 'Unknown payment provider' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed',
    }
  }
}

// ============================================
// RE-EXPORT INDIVIDUAL PROVIDERS
// ============================================

export * as stripe from '@/lib/stripe'
export * as square from './square'
export * as paypal from './paypal'
export * as crypto from './crypto'

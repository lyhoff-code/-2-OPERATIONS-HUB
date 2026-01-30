// Square Payment Provider
// Documentation: https://developer.squareup.com/

import { Client, Environment } from 'square'

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox,
})

export const square = {
  payments: squareClient.paymentsApi,
  customers: squareClient.customersApi,
  subscriptions: squareClient.subscriptionsApi,
  invoices: squareClient.invoicesApi,
  catalog: squareClient.catalogApi,
}

// ============================================
// PAYMENT PROCESSING
// ============================================

interface SquarePaymentParams {
  sourceId: string // Payment token from Square Web SDK
  amount: number // In cents
  currency?: string
  customerId?: string
  note?: string
  referenceId?: string
}

export async function createSquarePayment(params: SquarePaymentParams) {
  const { sourceId, amount, currency = 'USD', customerId, note, referenceId } = params

  try {
    const response = await square.payments.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(amount),
        currency,
      },
      customerId,
      note,
      referenceId,
    })

    return {
      success: true,
      paymentId: response.result.payment?.id,
      status: response.result.payment?.status,
      receiptUrl: response.result.payment?.receiptUrl,
    }
  } catch (error) {
    console.error('Square payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

interface SquareCustomerParams {
  email: string
  givenName?: string
  familyName?: string
  phoneNumber?: string
  referenceId?: string
}

export async function createSquareCustomer(params: SquareCustomerParams) {
  try {
    const response = await square.customers.createCustomer({
      idempotencyKey: crypto.randomUUID(),
      emailAddress: params.email,
      givenName: params.givenName,
      familyName: params.familyName,
      phoneNumber: params.phoneNumber,
      referenceId: params.referenceId,
    })

    return {
      success: true,
      customerId: response.result.customer?.id,
    }
  } catch (error) {
    console.error('Square customer error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    }
  }
}

// ============================================
// SUBSCRIPTIONS
// ============================================

interface SquareSubscriptionParams {
  customerId: string
  planId: string
  cardId: string
  startDate?: string
}

export async function createSquareSubscription(params: SquareSubscriptionParams) {
  try {
    const response = await square.subscriptions.createSubscription({
      idempotencyKey: crypto.randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      customerId: params.customerId,
      planVariationId: params.planId,
      cardId: params.cardId,
      startDate: params.startDate,
    })

    return {
      success: true,
      subscriptionId: response.result.subscription?.id,
      status: response.result.subscription?.status,
    }
  } catch (error) {
    console.error('Square subscription error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    }
  }
}

export async function cancelSquareSubscription(subscriptionId: string) {
  try {
    const response = await square.subscriptions.cancelSubscription(subscriptionId)
    return {
      success: true,
      status: response.result.subscription?.status,
    }
  } catch (error) {
    console.error('Square cancel error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

// ============================================
// REFUNDS
// ============================================

export async function createSquareRefund(
  paymentId: string,
  amount: number,
  currency: string = 'USD',
  reason?: string
) {
  try {
    const response = await square.payments.refundPayment({
      idempotencyKey: crypto.randomUUID(),
      paymentId,
      amountMoney: {
        amount: BigInt(amount),
        currency,
      },
      reason,
    })

    return {
      success: true,
      refundId: response.result.refund?.id,
      status: response.result.refund?.status,
    }
  } catch (error) {
    console.error('Square refund error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    }
  }
}

// Coinbase Commerce - Crypto Payment Provider
// Documentation: https://docs.cloud.coinbase.com/commerce/docs

const COINBASE_API_URL = 'https://api.commerce.coinbase.com'

async function coinbaseRequest(
  endpoint: string,
  method: string = 'GET',
  body?: object
) {
  const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
    method,
    headers: {
      'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
      'X-CC-Version': '2018-03-22',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return response.json()
}

// ============================================
// CHARGES (ONE-TIME PAYMENTS)
// ============================================

interface CryptoChargeParams {
  name: string
  description: string
  amount: number
  currency?: string
  customerId?: string
  metadata?: Record<string, string>
  redirectUrl?: string
  cancelUrl?: string
}

export async function createCryptoCharge(params: CryptoChargeParams) {
  const {
    name,
    description,
    amount,
    currency = 'USD',
    customerId,
    metadata = {},
    redirectUrl,
    cancelUrl,
  } = params

  const charge = await coinbaseRequest('/charges', 'POST', {
    name,
    description,
    pricing_type: 'fixed_price',
    local_price: {
      amount: amount.toFixed(2),
      currency,
    },
    metadata: {
      ...metadata,
      customer_id: customerId,
    },
    redirect_url: redirectUrl,
    cancel_url: cancelUrl,
  })

  return {
    success: true,
    chargeId: charge.data?.id,
    chargeCode: charge.data?.code,
    hostedUrl: charge.data?.hosted_url,
    expiresAt: charge.data?.expires_at,
    addresses: charge.data?.addresses, // BTC, ETH, USDC addresses
    pricing: charge.data?.pricing, // Amounts in each crypto
  }
}

export async function getCryptoCharge(chargeId: string) {
  const charge = await coinbaseRequest(`/charges/${chargeId}`)

  return {
    success: true,
    chargeId: charge.data?.id,
    status: charge.data?.timeline?.[charge.data.timeline.length - 1]?.status,
    payments: charge.data?.payments,
    confirmedAt: charge.data?.confirmed_at,
  }
}

// ============================================
// CHECKOUTS (REUSABLE PAYMENT LINKS)
// ============================================

interface CryptoCheckoutParams {
  name: string
  description: string
  requestedInfo?: ('name' | 'email')[]
  pricingType: 'fixed_price' | 'no_price'
  amount?: number
  currency?: string
}

export async function createCryptoCheckout(params: CryptoCheckoutParams) {
  const {
    name,
    description,
    requestedInfo = ['email'],
    pricingType,
    amount,
    currency = 'USD',
  } = params

  const checkout = await coinbaseRequest('/checkouts', 'POST', {
    name,
    description,
    requested_info: requestedInfo,
    pricing_type: pricingType,
    local_price: pricingType === 'fixed_price' ? {
      amount: amount?.toFixed(2),
      currency,
    } : undefined,
  })

  return {
    success: true,
    checkoutId: checkout.data?.id,
    hostedUrl: `https://commerce.coinbase.com/checkout/${checkout.data?.id}`,
  }
}

// ============================================
// INVOICES
// ============================================

interface CryptoInvoiceParams {
  businessName: string
  customerEmail: string
  customerName: string
  memo?: string
  items: Array<{
    name: string
    description?: string
    quantity: number
    unitPrice: number
  }>
  currency?: string
}

export async function createCryptoInvoice(params: CryptoInvoiceParams) {
  const {
    businessName,
    customerEmail,
    customerName,
    memo,
    items,
    currency = 'USD',
  } = params

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const invoice = await coinbaseRequest('/invoices', 'POST', {
    business_name: businessName,
    customer_email: customerEmail,
    customer_name: customerName,
    memo,
    local_price: {
      amount: totalAmount.toFixed(2),
      currency,
    },
    line_items: items.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity.toString(),
      unit_price: {
        amount: item.unitPrice.toFixed(2),
        currency,
      },
    })),
  })

  return {
    success: true,
    invoiceId: invoice.data?.id,
    invoiceCode: invoice.data?.code,
    hostedUrl: invoice.data?.hosted_url,
    status: invoice.data?.status,
  }
}

// ============================================
// WEBHOOK VERIFICATION
// ============================================

export function verifyCoinbaseWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}

// ============================================
// SUPPORTED CRYPTOCURRENCIES
// ============================================

export const SUPPORTED_CRYPTOS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    network: 'bitcoin',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    network: 'ethereum',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '$',
    network: 'ethereum',
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    icon: 'Ł',
    network: 'litecoin',
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    icon: 'Ð',
    network: 'dogecoin',
  },
  {
    symbol: 'BCH',
    name: 'Bitcoin Cash',
    icon: '₿',
    network: 'bitcoin-cash',
  },
]

// ============================================
// EXCHANGE RATES
// ============================================

export async function getCryptoExchangeRates(currency: string = 'USD') {
  const response = await coinbaseRequest(`/exchange-rates?currency=${currency}`)

  return {
    success: true,
    baseCurrency: currency,
    rates: response.data?.rates,
  }
}

// ============================================
// HELPER: Calculate crypto amount
// ============================================

export async function calculateCryptoAmount(
  usdAmount: number,
  cryptoSymbol: string
): Promise<{ amount: string; symbol: string }> {
  const rates = await getCryptoExchangeRates('USD')

  if (!rates.rates?.[cryptoSymbol]) {
    throw new Error(`Unsupported cryptocurrency: ${cryptoSymbol}`)
  }

  const rate = parseFloat(rates.rates[cryptoSymbol])
  const cryptoAmount = usdAmount * rate

  return {
    amount: cryptoAmount.toFixed(8),
    symbol: cryptoSymbol,
  }
}

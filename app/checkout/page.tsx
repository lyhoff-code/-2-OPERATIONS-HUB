'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

type PaymentMethod =
  | 'card'
  | 'ach'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'venmo'
  | 'klarna'
  | 'affirm'
  | 'afterpay'
  | 'crypto'

interface PaymentOption {
  id: PaymentMethod
  name: string
  icon: string
  description: string
  fee?: string
  badge?: string
  disabled?: boolean
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, Amex, Discover',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '',
    description: 'Quick checkout with Touch ID or Face ID',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: '🔵',
    description: 'Pay with your saved Google payment methods',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay securely with your PayPal account',
  },
  {
    id: 'venmo',
    name: 'Venmo',
    icon: '💙',
    description: 'Pay with your Venmo balance or linked bank',
    badge: 'Popular',
  },
  {
    id: 'ach',
    name: 'Bank Transfer (ACH)',
    icon: '🏦',
    description: 'Pay directly from your bank account',
    fee: 'Save 2%',
  },
  {
    id: 'klarna',
    name: 'Klarna',
    icon: '🟠',
    description: 'Pay in 4 interest-free installments',
    badge: 'Buy Now, Pay Later',
  },
  {
    id: 'affirm',
    name: 'Affirm',
    icon: '🔷',
    description: 'Monthly payments from 3-36 months',
    badge: 'Buy Now, Pay Later',
  },
  {
    id: 'afterpay',
    name: 'Afterpay',
    icon: '⬛',
    description: 'Pay in 4 interest-free payments',
    badge: 'Buy Now, Pay Later',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: '₿',
    description: 'Bitcoin, Ethereum, USDC, and more',
    fee: '1% fee',
  },
]

const cryptoOptions = [
  { id: 'btc', name: 'Bitcoin', icon: '₿', symbol: 'BTC' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', symbol: 'ETH' },
  { id: 'usdc', name: 'USD Coin', icon: '💲', symbol: 'USDC' },
  { id: 'ltc', name: 'Litecoin', icon: 'Ł', symbol: 'LTC' },
]

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    zip: '',
  })

  // Get amount from URL or default
  const amount = parseFloat(searchParams.get('amount') || '99')
  const planName = searchParams.get('plan') || 'Pro Plan'
  const interval = searchParams.get('interval') || 'month'

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    try {
      // In production, call the payment API
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: selectedMethod === 'crypto' ? `crypto_${selectedCrypto}` : selectedMethod,
          amount,
          email,
          planName,
        }),
      })

      const data = await response.json()

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else if (data.success) {
        toast.success('Payment successful!')
        window.location.href = '/dashboard?welcome=true'
      } else {
        throw new Error(data.error || 'Payment failed')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  // Calculate installment amounts for BNPL
  const klarnaInstallment = (amount / 4).toFixed(2)
  const affirmMonthly = (amount / 12).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-500 mt-2">Choose your preferred payment method</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email */}
            <div className="card p-6">
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Express Checkout */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Express Checkout</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedMethod('apple_pay')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedMethod === 'apple_pay'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl"></span>
                  <span className="text-sm font-medium">Apple Pay</span>
                </button>
                <button
                  onClick={() => setSelectedMethod('google_pay')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedMethod === 'google_pay'
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">🔵</span>
                  <span className="text-sm font-medium">Google Pay</span>
                </button>
                <button
                  onClick={() => setSelectedMethod('paypal')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">🅿️</span>
                  <span className="text-sm font-medium">PayPal</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">Or pay with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* All Payment Methods */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">All Payment Methods</h2>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMethod === option.id
                        ? 'border-revenue-500 bg-revenue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={option.id}
                      checked={selectedMethod === option.id}
                      onChange={() => !option.disabled && setSelectedMethod(option.id)}
                      disabled={option.disabled}
                      className="sr-only"
                    />
                    <span className="text-2xl w-10 text-center">{option.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{option.name}</span>
                        {option.badge && (
                          <span className="badge bg-purple-100 text-purple-700 text-xs">
                            {option.badge}
                          </span>
                        )}
                        {option.fee && (
                          <span className="badge bg-green-100 text-green-700 text-xs">
                            {option.fee}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === option.id
                          ? 'border-revenue-500 bg-revenue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedMethod === option.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Card Form */}
            {selectedMethod === 'card' && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Card Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, number: e.target.value })
                      }
                      className="input font-mono"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label">Expiry</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiry: e.target.value })
                        }
                        className="input"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="label">CVC</label>
                      <input
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvc: e.target.value })
                        }
                        className="input"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="label">ZIP Code</label>
                      <input
                        type="text"
                        value={cardDetails.zip}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, zip: e.target.value })
                        }
                        className="input"
                        placeholder="12345"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Crypto Selection */}
            {selectedMethod === 'crypto' && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Cryptocurrency</h3>
                <div className="grid grid-cols-2 gap-3">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => setSelectedCrypto(crypto.id)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        selectedCrypto === crypto.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{crypto.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{crypto.name}</p>
                        <p className="text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* BNPL Info */}
            {selectedMethod === 'klarna' && (
              <div className="card p-6 bg-orange-50 border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">Pay in 4 with Klarna</h3>
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="text-center">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-1">
                        {num}
                      </div>
                      <p className="text-sm font-medium">${klarnaInstallment}</p>
                      <p className="text-xs text-gray-500">
                        {num === 1 ? 'Today' : `${(num - 1) * 2} weeks`}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  No interest. No fees if paid on time.
                </p>
              </div>
            )}

            {selectedMethod === 'affirm' && (
              <div className="card p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Monthly Payments with Affirm</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a plan that works for you. As low as:
                </p>
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-600">${affirmMonthly}</span>
                  <span className="text-gray-500">/month for 12 months</span>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  0% APR available for qualified buyers
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{planName}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                {interval && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Billing</span>
                    <span className="text-gray-500">Per {interval}</span>
                  </div>
                )}
                {selectedMethod === 'ach' && (
                  <div className="flex justify-between text-green-600">
                    <span>ACH Discount</span>
                    <span>-{formatCurrency(amount * 0.02)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      selectedMethod === 'ach' ? amount * 0.98 : amount
                    )}
                    {interval && <span className="text-sm font-normal text-gray-500">/{interval}</span>}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !selectedMethod || !email}
                className="btn btn-revenue w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Pay {formatCurrency(selectedMethod === 'ach' ? amount * 0.98 : amount)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure 256-bit SSL encryption
              </div>

              {/* Payment Method Logos */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center mb-3">Accepted payment methods</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-2xl">💳</span>
                  <span className="text-2xl"></span>
                  <span className="text-2xl">🅿️</span>
                  <span className="text-2xl">💙</span>
                  <span className="text-2xl">🏦</span>
                  <span className="text-2xl">₿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface PaymentProvider {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  enabled: boolean
  testMode: boolean
  config: Record<string, string>
}

const initialProviders: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    description: 'Credit cards, ACH, Apple Pay, Google Pay, Klarna, Affirm',
    connected: true,
    enabled: true,
    testMode: true,
    config: {
      publishableKey: 'pk_test_****',
      secretKey: 'sk_test_****',
      webhookSecret: 'whsec_****',
    },
  },
  {
    id: 'paypal',
    name: 'PayPal & Venmo',
    icon: '🅿️',
    description: 'PayPal checkout and Venmo payments',
    connected: false,
    enabled: false,
    testMode: true,
    config: {
      clientId: '',
      clientSecret: '',
      webhookId: '',
    },
  },
  {
    id: 'square',
    name: 'Square',
    icon: '🟦',
    description: 'In-person and online payments',
    connected: false,
    enabled: false,
    testMode: true,
    config: {
      accessToken: '',
      locationId: '',
      webhookSignatureKey: '',
    },
  },
  {
    id: 'coinbase',
    name: 'Coinbase Commerce',
    icon: '₿',
    description: 'Bitcoin, Ethereum, USDC and more',
    connected: false,
    enabled: false,
    testMode: false,
    config: {
      apiKey: '',
      webhookSecret: '',
    },
  },
]

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Cards', provider: 'stripe', icon: '💳' },
  { id: 'apple_pay', name: 'Apple Pay', provider: 'stripe', icon: '' },
  { id: 'google_pay', name: 'Google Pay', provider: 'stripe', icon: '🔵' },
  { id: 'ach', name: 'ACH Bank Transfer', provider: 'stripe', icon: '🏦' },
  { id: 'klarna', name: 'Klarna (Buy Now, Pay Later)', provider: 'stripe', icon: '🟠' },
  { id: 'affirm', name: 'Affirm (Monthly Payments)', provider: 'stripe', icon: '🔷' },
  { id: 'afterpay', name: 'Afterpay', provider: 'stripe', icon: '⬛' },
  { id: 'paypal', name: 'PayPal', provider: 'paypal', icon: '🅿️' },
  { id: 'venmo', name: 'Venmo', provider: 'paypal', icon: '💙' },
  { id: 'crypto', name: 'Cryptocurrency', provider: 'coinbase', icon: '₿' },
]

export default function PaymentSettingsPage() {
  const [providers, setProviders] = useState(initialProviders)
  const [enabledMethods, setEnabledMethods] = useState<string[]>([
    'card',
    'apple_pay',
    'google_pay',
  ])
  const [editingProvider, setEditingProvider] = useState<string | null>(null)

  const handleToggleProvider = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, enabled: !p.enabled } : p
      )
    )
    toast.success('Provider settings updated')
  }

  const handleToggleMethod = (methodId: string) => {
    setEnabledMethods((prev) =>
      prev.includes(methodId)
        ? prev.filter((id) => id !== methodId)
        : [...prev, methodId]
    )
  }

  const handleSaveConfig = (providerId: string, config: Record<string, string>) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, config, connected: Object.values(config).every((v) => v.length > 0) }
          : p
      )
    )
    setEditingProvider(null)
    toast.success('Configuration saved')
  }

  const getProviderMethods = (providerId: string) =>
    paymentMethods.filter((m) => m.provider === providerId)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure your payment providers and accepted payment methods.
        </p>
      </div>

      {/* Payment Providers */}
      <div className="space-y-6 mb-12">
        <h2 className="font-semibold text-gray-900">Payment Providers</h2>

        {providers.map((provider) => (
          <div key={provider.id} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{provider.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    {provider.connected ? (
                      <span className="badge bg-green-100 text-green-700">Connected</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-700">Not Connected</span>
                    )}
                    {provider.testMode && provider.connected && (
                      <span className="badge bg-yellow-100 text-yellow-700">Test Mode</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{provider.description}</p>

                  {/* Payment methods for this provider */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {getProviderMethods(provider.id).map((method) => (
                      <span
                        key={method.id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          enabledMethods.includes(method.id) && provider.enabled
                            ? 'bg-revenue-100 text-revenue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <span>{method.icon}</span>
                        {method.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingProvider(provider.id)}
                  className="btn btn-secondary text-sm"
                >
                  Configure
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={provider.enabled}
                    onChange={() => handleToggleProvider(provider.id)}
                    className="sr-only peer"
                    disabled={!provider.connected}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-revenue-500"></div>
                </label>
              </div>
            </div>

            {/* Configuration Form */}
            {editingProvider === provider.id && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">API Configuration</h4>
                <div className="space-y-4">
                  {Object.entries(provider.config).map(([key, value]) => (
                    <div key={key}>
                      <label className="label capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      </label>
                      <input
                        type={key.toLowerCase().includes('secret') ? 'password' : 'text'}
                        defaultValue={value}
                        className="input font-mono text-sm"
                        placeholder={`Enter ${key}`}
                        onChange={(e) => {
                          provider.config[key] = e.target.value
                        }}
                      />
                    </div>
                  ))}

                  {/* Webhook URL */}
                  <div>
                    <label className="label">Webhook URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}/api/webhooks/${provider.id}`}
                        className="input font-mono text-sm bg-gray-50 flex-1"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}/api/webhooks/${provider.id}`
                          )
                          toast.success('Copied to clipboard')
                        }}
                        className="btn btn-secondary"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Add this URL to your {provider.name} dashboard
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setEditingProvider(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveConfig(provider.id, provider.config)}
                      className="btn btn-revenue"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        <h2 className="font-semibold text-gray-900">Enabled Payment Methods</h2>
        <p className="text-sm text-gray-500">
          Select which payment methods to show at checkout.
        </p>

        <div className="card p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const provider = providers.find((p) => p.id === method.provider)
              const isProviderEnabled = provider?.enabled && provider?.connected

              return (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    enabledMethods.includes(method.id) && isProviderEnabled
                      ? 'border-revenue-500 bg-revenue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isProviderEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={enabledMethods.includes(method.id)}
                    onChange={() => handleToggleMethod(method.id)}
                    disabled={!isProviderEnabled}
                    className="w-5 h-5 text-revenue-600 rounded"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500">via {provider?.name}</p>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>

      {/* Checkout Preview */}
      <div className="mt-12">
        <h2 className="font-semibold text-gray-900 mb-4">Checkout Preview</h2>
        <div className="card p-6 bg-gray-50 max-w-md">
          <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods
              .filter((m) => {
                const provider = providers.find((p) => p.id === m.provider)
                return (
                  enabledMethods.includes(m.id) &&
                  provider?.enabled &&
                  provider?.connected
                )
              })
              .map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
              ))}
          </div>
          {paymentMethods.filter((m) => {
            const provider = providers.find((p) => p.id === m.provider)
            return (
              enabledMethods.includes(m.id) &&
              provider?.enabled &&
              provider?.connected
            )
          }).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No payment methods enabled
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => toast.success('Payment settings saved')}
          className="btn btn-revenue"
        >
          Save All Settings
        </button>
      </div>
    </div>
  )
}

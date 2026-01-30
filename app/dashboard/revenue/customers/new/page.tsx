'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

const plans = [
  { id: 'basic', name: 'Basic', price: 99, interval: 'month' },
  { id: 'pro', name: 'Pro', price: 299, interval: 'month' },
  { id: 'enterprise', name: 'Enterprise', price: 599, interval: 'month' },
]

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    planId: '',
    sendInvite: true,
    trialDays: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In production, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Customer created successfully!')
      router.push('/dashboard/revenue/customers')
    } catch {
      toast.error('Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/revenue/customers"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Customers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-500 mt-1">
          Create a new customer and optionally start a subscription.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Customer Information</h2>

          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="john@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="input"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Subscription</h2>

          <div>
            <label className="label">Plan</label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`card p-4 cursor-pointer transition-all ${
                    formData.planId === plan.id
                      ? 'ring-2 ring-revenue-500 border-revenue-500'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={formData.planId === plan.id}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="sr-only"
                  />
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-lg font-bold text-revenue-600 mt-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                  </p>
                </label>
              ))}
            </div>
          </div>

          {formData.planId && (
            <div>
              <label className="label">Trial Period (days)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.trialDays}
                onChange={(e) =>
                  setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })
                }
                className="input w-32"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave at 0 for no trial period
              </p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.sendInvite}
              onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              className="w-4 h-4 text-revenue-600 rounded focus:ring-revenue-500"
            />
            <div>
              <p className="font-medium text-gray-900">Send payment invite</p>
              <p className="text-sm text-gray-500">
                Customer will receive an email with a link to enter payment details
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/revenue/customers" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn btn-revenue">
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  )
}

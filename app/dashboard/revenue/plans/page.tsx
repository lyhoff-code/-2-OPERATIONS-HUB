'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

// Demo data
const plans = [
  {
    id: '1',
    name: 'Basic',
    description: 'Perfect for individuals and small teams',
    price: 99,
    interval: 'month',
    tier: 'BASIC',
    features: [
      'Up to 5 team members',
      '10GB storage',
      'Basic support',
      'API access',
    ],
    activeSubscriptions: 45,
    mrr: 4455,
  },
  {
    id: '2',
    name: 'Pro',
    description: 'For growing teams that need more power',
    price: 299,
    interval: 'month',
    tier: 'PRO',
    features: [
      'Up to 25 team members',
      '100GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    activeSubscriptions: 78,
    mrr: 23322,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: 599,
    interval: 'month',
    tier: 'ENTERPRISE',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      '24/7 dedicated support',
      'Custom contracts',
      'SLA guarantee',
      'Dedicated account manager',
    ],
    activeSubscriptions: 33,
    mrr: 19767,
  },
]

const tierColors: Record<string, string> = {
  BASIC: 'border-gray-200 hover:border-gray-300',
  PRO: 'border-revenue-200 hover:border-revenue-300',
  ENTERPRISE: 'border-purple-200 hover:border-purple-300',
}

const tierBadgeColors: Record<string, string> = {
  BASIC: 'bg-gray-100 text-gray-700',
  PRO: 'bg-revenue-100 text-revenue-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
}

export default function PlansPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<typeof plans[0] | null>(null)

  const handleEdit = (plan: typeof plans[0]) => {
    setEditingPlan(plan)
    setShowModal(true)
  }

  const handleSave = () => {
    toast.success('Plan updated successfully')
    setShowModal(false)
    setEditingPlan(null)
  }

  const totalMRR = plans.reduce((sum, p) => sum + p.mrr, 0)
  const totalSubs = plans.reduce((sum, p) => sum + p.activeSubscriptions, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans & Pricing</h1>
          <p className="text-gray-500 mt-1">Configure your subscription tiers and pricing.</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null)
            setShowModal(true)
          }}
          className="btn btn-revenue"
        >
          Add Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Plans</p>
          <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">{totalSubs}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total MRR</p>
          <p className="text-2xl font-bold text-revenue-600">{formatCurrency(totalMRR)}</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card p-6 border-2 transition-colors ${tierColors[plan.tier]}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`badge ${tierBadgeColors[plan.tier]}`}>{plan.tier}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(plan.price)}
              </span>
              <span className="text-gray-500">/{plan.interval}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-revenue-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Active subscriptions</span>
                <span className="font-medium text-gray-900">{plan.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MRR</span>
                <span className="font-medium text-revenue-600">{formatCurrency(plan.mrr)}</span>
              </div>
            </div>

            <button
              onClick={() => handleEdit(plan)}
              className="btn btn-secondary w-full mt-4"
            >
              Edit Plan
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Plan Name</label>
                <input
                  type="text"
                  className="input"
                  defaultValue={editingPlan?.name}
                  placeholder="e.g., Pro"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={2}
                  defaultValue={editingPlan?.description}
                  placeholder="Brief description of this plan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price</label>
                  <input
                    type="number"
                    className="input"
                    defaultValue={editingPlan?.price}
                    placeholder="99"
                  />
                </div>
                <div>
                  <label className="label">Interval</label>
                  <select className="input" defaultValue={editingPlan?.interval || 'month'}>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Tier</label>
                <select className="input" defaultValue={editingPlan?.tier || 'BASIC'}>
                  <option value="BASIC">Basic</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="label">Features (one per line)</label>
                <textarea
                  className="input"
                  rows={4}
                  defaultValue={editingPlan?.features.join('\n')}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-revenue">
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

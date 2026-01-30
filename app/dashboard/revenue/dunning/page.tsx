'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

// Demo data - customers in dunning process
const dunningCustomers = [
  {
    id: '1',
    customer: 'DataSystems',
    email: 'finance@datasystems.co',
    amount: 299,
    failedAt: '2024-01-20',
    dayInSequence: 5,
    attempts: 2,
    nextRetry: '2024-01-25',
    lastEmailSent: 'card_update_requested',
    status: 'IN_PROGRESS',
  },
  {
    id: '2',
    customer: 'CloudTech',
    email: 'support@cloudtech.dev',
    amount: 299,
    failedAt: '2024-01-15',
    dayInSequence: 10,
    attempts: 3,
    nextRetry: null,
    lastEmailSent: 'final_warning',
    status: 'FINAL_WARNING',
  },
  {
    id: '3',
    customer: 'StartupABC',
    email: 'billing@startabc.io',
    amount: 99,
    failedAt: '2024-01-22',
    dayInSequence: 3,
    attempts: 1,
    nextRetry: '2024-01-25',
    lastEmailSent: 'payment_failed',
    status: 'IN_PROGRESS',
  },
]

const recoveredPayments = [
  { customer: 'TechFlow', amount: 299, recoveredAt: '2024-01-18', dayRecovered: 3 },
  { customer: 'WebAgency', amount: 599, recoveredAt: '2024-01-15', dayRecovered: 5 },
  { customer: 'DesignCo', amount: 149, recoveredAt: '2024-01-12', dayRecovered: 1 },
  { customer: 'AppStudio', amount: 299, recoveredAt: '2024-01-10', dayRecovered: 7 },
  { customer: 'DevShop', amount: 99, recoveredAt: '2024-01-08', dayRecovered: 3 },
]

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  FINAL_WARNING: 'bg-red-100 text-red-800',
  PAUSED: 'bg-gray-100 text-gray-800',
  RECOVERED: 'bg-green-100 text-green-800',
}

const dunningSequence = [
  { day: 1, action: 'Payment failed email', description: 'Notify customer payment failed' },
  { day: 1, action: 'Auto retry #1', description: 'First automatic retry' },
  { day: 3, action: 'Card update email', description: 'Request to update payment method' },
  { day: 3, action: 'Auto retry #2', description: 'Second automatic retry' },
  { day: 7, action: 'Final warning email', description: 'Service will be paused' },
  { day: 7, action: 'Auto retry #3', description: 'Final automatic retry' },
  { day: 10, action: 'Service paused', description: 'Subscription access revoked' },
]

export default function DunningPage() {
  const [showSettings, setShowSettings] = useState(false)

  const stats = {
    inDunning: dunningCustomers.length,
    atRisk: dunningCustomers.filter((c) => c.status === 'FINAL_WARNING').length,
    recovered30d: recoveredPayments.length,
    recoveryRate: 71,
    totalAtRisk: dunningCustomers.reduce((sum, c) => sum + c.amount, 0),
    totalRecovered: recoveredPayments.reduce((sum, p) => sum + p.amount, 0),
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dunning Management</h1>
          <p className="text-gray-500 mt-1">
            Recover failed payments automatically with smart retry logic.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-secondary"
        >
          Configure Dunning
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-gray-500">In Dunning</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inDunning}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(stats.totalAtRisk)} at risk
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Final Warning</p>
          <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
          <p className="text-sm text-gray-500 mt-1">Need attention</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Recovered (30d)</p>
          <p className="text-2xl font-bold text-green-600">{stats.recovered30d}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(stats.totalRecovered)} recovered
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Recovery Rate</p>
          <p className="text-2xl font-bold text-revenue-600">{stats.recoveryRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Industry avg: 38%</p>
        </div>
      </div>

      {/* Dunning Sequence Settings */}
      {showSettings && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Dunning Sequence</h2>
          <div className="space-y-3">
            {dunningSequence.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 rounded-full bg-revenue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-revenue-700">D{step.day}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{step.action}</p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Dunning */}
      <div className="card mb-8">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Active Dunning</h2>
          <span className="badge bg-yellow-100 text-yellow-800">
            {dunningCustomers.length} customers
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Day</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Next Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dunningCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{customer.customer}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </td>
                  <td className="font-medium text-red-600">
                    {formatCurrency(customer.amount)}
                  </td>
                  <td>
                    <span className="text-gray-900">Day {customer.dayInSequence}</span>
                  </td>
                  <td>
                    <span className="text-gray-500">{customer.attempts}/3</span>
                  </td>
                  <td>
                    <span className={`badge ${statusColors[customer.status]}`}>
                      {customer.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {customer.nextRetry
                      ? `Retry on ${formatDate(customer.nextRetry)}`
                      : 'Awaiting action'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-revenue-600 hover:text-revenue-700 font-medium text-sm">
                        Contact
                      </button>
                      <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                        Pause
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Recovered */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recently Recovered</h2>
          <span className="badge bg-green-100 text-green-800">Last 30 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Recovered On</th>
                <th>Day Recovered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recoveredPayments.map((payment, i) => (
                <tr key={i}>
                  <td className="font-medium text-gray-900">{payment.customer}</td>
                  <td className="font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="text-gray-500">{formatDate(payment.recoveredAt)}</td>
                  <td>
                    <span className="badge bg-green-100 text-green-800">
                      Day {payment.dayRecovered}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

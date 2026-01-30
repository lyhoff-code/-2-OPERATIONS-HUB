'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

// Demo data
const subscriptions = [
  {
    id: '1',
    customer: 'Acme Corp',
    email: 'billing@acme.com',
    plan: 'Enterprise',
    status: 'ACTIVE',
    mrr: 599,
    startDate: '2023-06-15',
    currentPeriodEnd: '2024-02-15',
    cancelAtPeriodEnd: false,
  },
  {
    id: '2',
    customer: 'TechFlow',
    email: 'admin@techflow.io',
    plan: 'Pro',
    status: 'ACTIVE',
    mrr: 299,
    startDate: '2023-08-01',
    currentPeriodEnd: '2024-02-01',
    cancelAtPeriodEnd: false,
  },
  {
    id: '3',
    customer: 'DataSystems',
    email: 'finance@datasystems.co',
    plan: 'Pro',
    status: 'PAST_DUE',
    mrr: 299,
    startDate: '2023-10-15',
    currentPeriodEnd: '2024-01-15',
    cancelAtPeriodEnd: false,
  },
  {
    id: '4',
    customer: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    plan: 'Basic',
    status: 'ACTIVE',
    mrr: 99,
    startDate: '2023-08-01',
    currentPeriodEnd: '2024-02-01',
    cancelAtPeriodEnd: true,
  },
  {
    id: '5',
    customer: 'CloudTech',
    email: 'support@cloudtech.dev',
    plan: 'Pro',
    status: 'TRIALING',
    mrr: 0,
    startDate: '2024-01-20',
    currentPeriodEnd: '2024-02-04',
    cancelAtPeriodEnd: false,
  },
  {
    id: '6',
    customer: 'WebAgency',
    email: 'accounts@webagency.com',
    plan: 'Enterprise',
    status: 'CANCELED',
    mrr: 0,
    startDate: '2023-03-01',
    currentPeriodEnd: '2024-01-01',
    cancelAtPeriodEnd: false,
  },
]

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PAST_DUE: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-100 text-gray-800',
  TRIALING: 'bg-blue-100 text-blue-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
}

const planColors: Record<string, string> = {
  Basic: 'bg-gray-100 text-gray-700',
  Pro: 'bg-revenue-100 text-revenue-700',
  Enterprise: 'bg-purple-100 text-purple-700',
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.customer.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE')
  const totalMRR = activeSubs.reduce((sum, s) => sum + s.mrr, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500 mt-1">Manage recurring billing and subscription lifecycle.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeSubs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Trialing</p>
          <p className="text-2xl font-bold text-blue-600">
            {subscriptions.filter((s) => s.status === 'TRIALING').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Past Due</p>
          <p className="text-2xl font-bold text-red-600">
            {subscriptions.filter((s) => s.status === 'PAST_DUE').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total MRR</p>
          <p className="text-2xl font-bold text-revenue-600">{formatCurrency(totalMRR)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIALING">Trialing</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELED">Canceled</option>
            <option value="PAUSED">Paused</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Subscription List */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Status</th>
              <th>MRR</th>
              <th>Current Period</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <div>
                    <p className="font-medium text-gray-900">{sub.customer}</p>
                    <p className="text-sm text-gray-500">{sub.email}</p>
                  </div>
                </td>
                <td>
                  <span className={`badge ${planColors[sub.plan]}`}>{sub.plan}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusColors[sub.status]}`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                    {sub.cancelAtPeriodEnd && (
                      <span className="text-xs text-yellow-600">Canceling</span>
                    )}
                  </div>
                </td>
                <td className="font-medium">{formatCurrency(sub.mrr)}</td>
                <td className="text-gray-500">
                  <span>Ends {formatDate(sub.currentPeriodEnd)}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/revenue/subscriptions/${sub.id}`}
                      className="text-revenue-600 hover:text-revenue-700 font-medium text-sm"
                    >
                      Manage
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscriptions.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        )}
      </div>
    </div>
  )
}

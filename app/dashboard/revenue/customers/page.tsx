'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

// Demo data
const customers = [
  {
    id: '1',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    company: 'Acme Corporation',
    plan: 'Enterprise',
    status: 'ACTIVE',
    mrr: 599,
    ltv: 4193,
    subscriptionStart: '2023-06-15',
    lastPayment: '2024-01-15',
  },
  {
    id: '2',
    name: 'TechFlow',
    email: 'admin@techflow.io',
    company: 'TechFlow Inc',
    plan: 'Pro',
    status: 'ACTIVE',
    mrr: 299,
    ltv: 2093,
    subscriptionStart: '2023-08-01',
    lastPayment: '2024-01-01',
  },
  {
    id: '3',
    name: 'DataSystems',
    email: 'finance@datasystems.co',
    company: 'DataSystems LLC',
    plan: 'Pro',
    status: 'PAST_DUE',
    mrr: 299,
    ltv: 1196,
    subscriptionStart: '2023-10-15',
    lastPayment: '2023-12-15',
  },
  {
    id: '4',
    name: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    company: 'StartupXYZ',
    plan: 'Basic',
    status: 'ACTIVE',
    mrr: 99,
    ltv: 594,
    subscriptionStart: '2023-08-01',
    lastPayment: '2024-01-01',
  },
  {
    id: '5',
    name: 'CloudTech',
    email: 'support@cloudtech.dev',
    company: 'CloudTech Solutions',
    plan: 'Basic',
    status: 'TRIALING',
    mrr: 0,
    ltv: 0,
    subscriptionStart: '2024-01-20',
    lastPayment: null,
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

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.company?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer base and billing relationships.</p>
        </div>
        <Link href="/dashboard/revenue/customers/new" className="btn btn-revenue">
          Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers..."
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
            <option value="PAST_DUE">Past Due</option>
            <option value="TRIALING">Trialing</option>
            <option value="CANCELED">Canceled</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {customers.filter((c) => c.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Past Due</p>
          <p className="text-2xl font-bold text-red-600">
            {customers.filter((c) => c.status === 'PAST_DUE').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total MRR</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(customers.reduce((sum, c) => sum + c.mrr, 0))}
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Status</th>
              <th>MRR</th>
              <th>LTV</th>
              <th>Last Payment</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-revenue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-revenue-700">
                        {getInitials(customer.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${planColors[customer.plan]}`}>
                    {customer.plan}
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusColors[customer.status]}`}>
                    {customer.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="font-medium">{formatCurrency(customer.mrr)}</td>
                <td className="text-gray-500">{formatCurrency(customer.ltv)}</td>
                <td className="text-gray-500">
                  {customer.lastPayment ? formatDate(customer.lastPayment) : '-'}
                </td>
                <td>
                  <Link
                    href={`/dashboard/revenue/customers/${customer.id}`}
                    className="text-revenue-600 hover:text-revenue-700 font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}

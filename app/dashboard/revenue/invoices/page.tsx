'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

// Demo data
const invoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customer: 'Acme Corp',
    email: 'billing@acme.com',
    amount: 599,
    status: 'PAID',
    dueDate: '2024-01-30',
    paidAt: '2024-01-28',
    items: [{ description: 'Enterprise Plan - Monthly', quantity: 1, amount: 599 }],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customer: 'TechFlow',
    email: 'admin@techflow.io',
    amount: 299,
    status: 'PAID',
    dueDate: '2024-01-28',
    paidAt: '2024-01-27',
    items: [{ description: 'Pro Plan - Monthly', quantity: 1, amount: 299 }],
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customer: 'DataSystems',
    email: 'finance@datasystems.co',
    amount: 299,
    status: 'SENT',
    dueDate: '2024-02-01',
    paidAt: null,
    items: [{ description: 'Pro Plan - Monthly', quantity: 1, amount: 299 }],
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    customer: 'StartupXYZ',
    email: 'hello@startupxyz.com',
    amount: 99,
    status: 'DRAFT',
    dueDate: '2024-02-05',
    paidAt: null,
    items: [{ description: 'Basic Plan - Monthly', quantity: 1, amount: 99 }],
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    customer: 'CloudTech',
    email: 'support@cloudtech.dev',
    amount: 299,
    status: 'UNCOLLECTIBLE',
    dueDate: '2024-01-15',
    paidAt: null,
    items: [{ description: 'Pro Plan - Monthly', quantity: 1, amount: 299 }],
  },
]

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  VOID: 'bg-gray-100 text-gray-800',
  UNCOLLECTIBLE: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(search.toLowerCase()) ||
      invoice.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === 'PAID').length,
    pending: invoices.filter((i) => ['DRAFT', 'SENT'].includes(i.status)).length,
    overdue: invoices.filter((i) => i.status === 'UNCOLLECTIBLE').length,
    totalPaid: invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
    totalPending: invoices
      .filter((i) => ['DRAFT', 'SENT'].includes(i.status))
      .reduce((sum, i) => sum + i.amount, 0),
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Create, send, and track invoices.</p>
        </div>
        <Link href="/dashboard/revenue/invoices/new" className="btn btn-revenue">
          Create Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.paid} ({formatCurrency(stats.totalPaid)})
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pending} ({formatCurrency(stats.totalPending)})
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search invoices..."
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
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="VOID">Void</option>
            <option value="UNCOLLECTIBLE">Uncollectible</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Paid At</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="font-medium text-gray-900">{invoice.invoiceNumber}</td>
                <td>
                  <div>
                    <p className="text-gray-900">{invoice.customer}</p>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                </td>
                <td className="font-medium">{formatCurrency(invoice.amount)}</td>
                <td>
                  <span className={`badge ${statusColors[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="text-gray-500">{formatDate(invoice.dueDate)}</td>
                <td className="text-gray-500">
                  {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/revenue/invoices/${invoice.id}`}
                      className="text-revenue-600 hover:text-revenue-700 font-medium text-sm"
                    >
                      View
                    </Link>
                    {invoice.status === 'DRAFT' && (
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Send
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  )
}

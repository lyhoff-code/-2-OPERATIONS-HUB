'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatNumber, formatPercentage, calculatePercentageChange } from '@/lib/utils'

// Demo data
const metrics = {
  mrr: { current: 24500, previous: 22650 },
  arr: { current: 294000, previous: 271800 },
  churnRate: { current: 2.3, previous: 2.8 },
  ltv: { current: 1250, previous: 1180 },
  cac: { current: 150, previous: 165 },
  activeCustomers: { current: 156, previous: 148 },
  newCustomers: 12,
  churnedCustomers: 4,
}

const recentInvoices = [
  { id: '1', customer: 'Acme Corp', amount: 299, status: 'PAID', date: '2024-01-28' },
  { id: '2', customer: 'TechFlow', amount: 599, status: 'PAID', date: '2024-01-27' },
  { id: '3', customer: 'DataSystems', amount: 299, status: 'PENDING', date: '2024-01-26' },
  { id: '4', customer: 'StartupXYZ', amount: 149, status: 'PAID', date: '2024-01-25' },
  { id: '5', customer: 'CloudTech', amount: 299, status: 'FAILED', date: '2024-01-24' },
]

const topCustomers = [
  { name: 'Acme Corp', revenue: 3588, plan: 'Enterprise' },
  { name: 'TechFlow', revenue: 2394, plan: 'Pro' },
  { name: 'DataSystems', revenue: 1796, plan: 'Pro' },
  { name: 'CloudTech', revenue: 1496, plan: 'Basic' },
  { name: 'StartupXYZ', revenue: 1196, plan: 'Basic' },
]

function MetricCard({
  title,
  current,
  previous,
  format = 'currency',
  prefix = '',
  suffix = '',
}: {
  title: string
  current: number
  previous: number
  format?: 'currency' | 'number' | 'percentage'
  prefix?: string
  suffix?: string
}) {
  const change = calculatePercentageChange(current, previous)
  const isPositive = change >= 0

  const formatValue = (value: number) => {
    if (format === 'currency') return formatCurrency(value)
    if (format === 'percentage') return formatPercentage(value)
    return formatNumber(value)
  }

  return (
    <div className="metric-card">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="metric-value">
          {prefix}
          {formatValue(current)}
          {suffix}
        </span>
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}
          {formatPercentage(change)}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">vs last month</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800',
    VOID: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

export default function RevenueOverviewPage() {
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💚</span>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Manager</h1>
          </div>
          <p className="text-gray-500 mt-1">Track revenue, manage billing, and recover failed payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <Link href="/dashboard/revenue/customers/new" className="btn btn-revenue">
            Add Customer
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MetricCard
          title="MRR"
          current={metrics.mrr.current}
          previous={metrics.mrr.previous}
        />
        <MetricCard
          title="ARR"
          current={metrics.arr.current}
          previous={metrics.arr.previous}
        />
        <MetricCard
          title="Churn Rate"
          current={metrics.churnRate.current}
          previous={metrics.churnRate.previous}
          format="percentage"
        />
        <MetricCard
          title="LTV"
          current={metrics.ltv.current}
          previous={metrics.ltv.previous}
        />
        <MetricCard
          title="CAC"
          current={metrics.cac.current}
          previous={metrics.cac.previous}
        />
        <div className="metric-card">
          <p className="text-sm text-gray-500">LTV/CAC Ratio</p>
          <div className="mt-2">
            <span className="metric-value">
              {(metrics.ltv.current / metrics.cac.current).toFixed(1)}x
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">Healthy ratio (target: 3x+)</p>
        </div>
      </div>

      {/* Customer Movement */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Customer Movement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Customers</span>
              <span className="font-semibold text-gray-900">
                {metrics.activeCustomers.current}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New This Month</span>
              <span className="font-semibold text-green-600">+{metrics.newCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churned This Month</span>
              <span className="font-semibold text-red-600">-{metrics.churnedCustomers}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-gray-600">Net Change</span>
              <span className="font-semibold text-green-600">
                +{metrics.newCustomers - metrics.churnedCustomers}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">MRR Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Starting MRR</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(metrics.mrr.previous)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New MRR</span>
              <span className="font-semibold text-green-600">+{formatCurrency(1800)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expansion MRR</span>
              <span className="font-semibold text-blue-600">+{formatCurrency(450)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Churned MRR</span>
              <span className="font-semibold text-red-600">-{formatCurrency(400)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-gray-600">Ending MRR</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(metrics.mrr.current)}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Dunning Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Failed Payments</span>
              <span className="font-semibold text-red-600">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Recovery</span>
              <span className="font-semibold text-yellow-600">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recovered (30d)</span>
              <span className="font-semibold text-green-600">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recovery Rate</span>
              <span className="font-semibold text-gray-900">71%</span>
            </div>
            <Link
              href="/dashboard/revenue/dunning"
              className="block text-center text-sm text-revenue-600 hover:text-revenue-700 mt-2"
            >
              View Dunning Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
            <Link
              href="/dashboard/revenue/invoices"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-medium text-gray-900">{invoice.customer}</td>
                    <td>{formatCurrency(invoice.amount)}</td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="text-gray-500">{invoice.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Customers by Revenue</h2>
            <Link
              href="/dashboard/revenue/customers"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCustomers.map((customer, i) => (
                  <tr key={i}>
                    <td className="font-medium text-gray-900">{customer.name}</td>
                    <td>
                      <span className="badge bg-gray-100 text-gray-700">
                        {customer.plan}
                      </span>
                    </td>
                    <td className="text-green-600 font-medium">
                      {formatCurrency(customer.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

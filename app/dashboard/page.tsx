'use client'

import Link from 'next/link'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

// Demo data
const revenueMetrics = {
  mrr: 24500,
  arr: 294000,
  churnRate: 2.3,
  activeSubscriptions: 156,
  newThisMonth: 12,
  pendingPayments: 3,
}

const supportMetrics = {
  openTickets: 8,
  resolvedToday: 23,
  avgResponseTime: 4.2, // minutes
  botResolutionRate: 67,
  csatScore: 4.6,
  pendingHandoffs: 2,
}

const recentActivity = [
  { type: 'payment', message: 'Payment received from Acme Corp', amount: 299, time: '5m ago', color: 'bg-green-500' },
  { type: 'ticket', message: 'New ticket from john@startup.io', time: '12m ago', color: 'bg-support-500' },
  { type: 'subscription', message: 'TechFlow upgraded to Pro plan', time: '1h ago', color: 'bg-revenue-500' },
  { type: 'dunning', message: 'Payment retry successful for DataSystems', time: '2h ago', color: 'bg-yellow-500' },
  { type: 'bot', message: 'Bot resolved "password reset" ticket', time: '3h ago', color: 'bg-support-400' },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* MRR */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-revenue-500 text-2xl">💚</span>
            <span className="badge bg-green-100 text-green-700">+8.2%</span>
          </div>
          <div className="metric-value mt-2">{formatCurrency(revenueMetrics.mrr)}</div>
          <div className="metric-label">Monthly Recurring Revenue</div>
        </div>

        {/* Active Subscriptions */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-revenue-500 text-2xl">📊</span>
            <span className="badge bg-green-100 text-green-700">+{revenueMetrics.newThisMonth} new</span>
          </div>
          <div className="metric-value mt-2">{revenueMetrics.activeSubscriptions}</div>
          <div className="metric-label">Active Subscriptions</div>
        </div>

        {/* Open Tickets */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-support-500 text-2xl">💜</span>
            {supportMetrics.pendingHandoffs > 0 && (
              <span className="badge bg-red-100 text-red-700">{supportMetrics.pendingHandoffs} need attention</span>
            )}
          </div>
          <div className="metric-value mt-2">{supportMetrics.openTickets}</div>
          <div className="metric-label">Open Tickets</div>
        </div>

        {/* Bot Resolution Rate */}
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-support-500 text-2xl">🤖</span>
            <span className="badge bg-green-100 text-green-700">Target: 65%</span>
          </div>
          <div className="metric-value mt-2">{supportMetrics.botResolutionRate}%</div>
          <div className="metric-label">Bot Resolution Rate</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/dashboard/activity" className="text-sm text-gray-500 hover:text-gray-700">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-medium text-green-600">
                      +{formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Revenue Manager Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <span className="text-lg">💚</span>
                <h2 className="font-semibold text-gray-900">Revenue Manager</h2>
              </div>
            </div>
            <div className="card-body space-y-3">
              <Link
                href="/dashboard/revenue/customers/new"
                className="btn btn-revenue w-full"
              >
                Add Customer
              </Link>
              <Link
                href="/dashboard/revenue/invoices/new"
                className="btn btn-secondary w-full"
              >
                Create Invoice
              </Link>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Payments</span>
                  <span className="font-medium text-yellow-600">{revenueMetrics.pendingPayments}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Churn Rate</span>
                  <span className="font-medium text-gray-900">{formatPercentage(revenueMetrics.churnRate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Bot Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <span className="text-lg">💜</span>
                <h2 className="font-semibold text-gray-900">Support Bot</h2>
              </div>
            </div>
            <div className="card-body space-y-3">
              <Link
                href="/dashboard/support/tickets"
                className="btn btn-support w-full"
              >
                View Tickets
              </Link>
              <Link
                href="/dashboard/support/knowledge-base/new"
                className="btn btn-secondary w-full"
              >
                Add Article
              </Link>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Avg Response Time</span>
                  <span className="font-medium text-gray-900">{supportMetrics.avgResponseTime}m</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">CSAT Score</span>
                  <span className="font-medium text-green-600">{supportMetrics.csatScore}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(revenueMetrics.pendingPayments > 0 || supportMetrics.pendingHandoffs > 0) && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900 mb-4">Needs Attention</h2>
          <div className="space-y-3">
            {revenueMetrics.pendingPayments > 0 && (
              <div className="card p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {revenueMetrics.pendingPayments} payments need attention
                    </p>
                    <p className="text-sm text-gray-500">
                      These customers have failed payments in the dunning process
                    </p>
                  </div>
                  <Link href="/dashboard/revenue/dunning" className="btn btn-secondary">
                    View Dunning
                  </Link>
                </div>
              </div>
            )}
            {supportMetrics.pendingHandoffs > 0 && (
              <div className="card p-4 border-l-4 border-support-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {supportMetrics.pendingHandoffs} tickets waiting for human
                    </p>
                    <p className="text-sm text-gray-500">
                      Customers have requested to speak with a human agent
                    </p>
                  </div>
                  <Link href="/dashboard/support/tickets?filter=handoff" className="btn btn-secondary">
                    View Tickets
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { formatNumber, formatPercentage } from '@/lib/utils'

// Demo data
const metrics = {
  openTickets: 8,
  resolvedToday: 23,
  avgResponseTime: 4.2,
  avgResolutionTime: 45,
  botResolutionRate: 67,
  humanResolutionRate: 33,
  csatScore: 4.6,
  totalTickets30d: 312,
}

const ticketsByCategory = [
  { category: 'Billing', count: 89, percentage: 28.5 },
  { category: 'Technical', count: 78, percentage: 25 },
  { category: 'Account', count: 62, percentage: 19.9 },
  { category: 'General', count: 45, percentage: 14.4 },
  { category: 'Feature Request', count: 38, percentage: 12.2 },
]

const recentTickets = [
  {
    id: '1',
    ticketNumber: 'TKT-2401-A1B2',
    subject: 'Cannot access my account',
    customer: 'john@startup.io',
    status: 'OPEN',
    priority: 'HIGH',
    source: 'CHAT',
    createdAt: '5 min ago',
  },
  {
    id: '2',
    ticketNumber: 'TKT-2401-C3D4',
    subject: 'How do I upgrade my plan?',
    customer: 'sarah@techco.com',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    source: 'EMAIL',
    createdAt: '23 min ago',
  },
  {
    id: '3',
    ticketNumber: 'TKT-2401-E5F6',
    subject: 'Payment not going through',
    customer: 'mike@agency.co',
    status: 'WAITING',
    priority: 'URGENT',
    source: 'CHAT',
    createdAt: '1 hour ago',
  },
  {
    id: '4',
    ticketNumber: 'TKT-2401-G7H8',
    subject: 'Feature request: Dark mode',
    customer: 'lisa@design.io',
    status: 'OPEN',
    priority: 'LOW',
    source: 'WEB_FORM',
    createdAt: '2 hours ago',
  },
]

const activeConversations = [
  {
    id: '1',
    customer: 'Anonymous User',
    lastMessage: 'How do I reset my password?',
    status: 'BOT_HANDLING',
    time: '2 min ago',
  },
  {
    id: '2',
    customer: 'maria@company.com',
    lastMessage: 'I need to speak to someone',
    status: 'HANDOFF_REQUESTED',
    time: '5 min ago',
  },
  {
    id: '3',
    customer: 'alex@dev.io',
    lastMessage: 'Thanks, that worked!',
    status: 'RESOLVED',
    time: '8 min ago',
  },
]

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  WAITING: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const conversationStatusColors: Record<string, string> = {
  BOT_HANDLING: 'bg-support-100 text-support-800',
  HANDOFF_REQUESTED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-green-100 text-green-800',
}

export default function SupportOverviewPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💜</span>
            <h1 className="text-2xl font-bold text-gray-900">Support Bot</h1>
          </div>
          <p className="text-gray-500 mt-1">AI-powered customer support and ticket management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/support/knowledge-base/new" className="btn btn-secondary">
            Add Article
          </Link>
          <Link href="/dashboard/support/tickets" className="btn btn-support">
            View Tickets
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-support-500 text-xl">🎫</span>
            {metrics.openTickets > 5 && (
              <span className="badge bg-yellow-100 text-yellow-800">Needs attention</span>
            )}
          </div>
          <div className="metric-value mt-2">{metrics.openTickets}</div>
          <div className="metric-label">Open Tickets</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-support-500 text-xl">⏱️</span>
          </div>
          <div className="metric-value mt-2">{metrics.avgResponseTime}m</div>
          <div className="metric-label">Avg Response Time</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-support-500 text-xl">🤖</span>
            <span className="badge bg-green-100 text-green-800">Target: 65%</span>
          </div>
          <div className="metric-value mt-2">{metrics.botResolutionRate}%</div>
          <div className="metric-label">Bot Resolution Rate</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-support-500 text-xl">⭐</span>
          </div>
          <div className="metric-value mt-2">{metrics.csatScore}/5</div>
          <div className="metric-label">CSAT Score</div>
        </div>
      </div>

      {/* Resolution Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Resolution Breakdown</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="12"
                  strokeDasharray={`${(metrics.botResolutionRate / 100) * 352} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {metrics.botResolutionRate}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-support-500" />
                Bot Resolved
              </span>
              <span className="font-medium">{metrics.botResolutionRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                Human Resolved
              </span>
              <span className="font-medium">{metrics.humanResolutionRate}%</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Tickets by Category</h3>
          <div className="space-y-3">
            {ticketsByCategory.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{cat.category}</span>
                  <span className="font-medium text-gray-900">{cat.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-2 bg-support-500 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Active Conversations</h3>
          <div className="space-y-3">
            {activeConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{conv.customer}</span>
                  <span className={`badge text-xs ${conversationStatusColors[conv.status]}`}>
                    {conv.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-gray-400 mt-1">{conv.time}</p>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/support/conversations"
            className="block text-center text-sm text-support-600 hover:text-support-700 mt-4"
          >
            View all conversations →
          </Link>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
          <Link
            href="/dashboard/support/tickets"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Source</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{ticket.ticketNumber}</p>
                      <p className="text-sm text-gray-500">{ticket.subject}</p>
                    </div>
                  </td>
                  <td className="text-gray-600">{ticket.customer}</td>
                  <td>
                    <span className={`badge ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="text-gray-500">{ticket.source}</td>
                  <td className="text-gray-500">{ticket.createdAt}</td>
                  <td>
                    <Link
                      href={`/dashboard/support/tickets/${ticket.id}`}
                      className="text-support-600 hover:text-support-700 font-medium text-sm"
                    >
                      View
                    </Link>
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

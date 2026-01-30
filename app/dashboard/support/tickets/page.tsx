'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'

// Demo data
const tickets = [
  {
    id: '1',
    ticketNumber: 'TKT-2401-A1B2',
    subject: 'Cannot access my account',
    description: 'I\'ve been trying to log in but keep getting an error message.',
    customer: { name: 'John Smith', email: 'john@startup.io' },
    assignedTo: null,
    status: 'OPEN',
    priority: 'HIGH',
    category: 'Account',
    source: 'CHAT',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    ticketNumber: 'TKT-2401-C3D4',
    subject: 'How do I upgrade my plan?',
    description: 'I want to upgrade from Basic to Pro but can\'t find the option.',
    customer: { name: 'Sarah Johnson', email: 'sarah@techco.com' },
    assignedTo: { name: 'Support Agent', email: 'agent@company.com' },
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'Billing',
    source: 'EMAIL',
    createdAt: new Date(Date.now() - 23 * 60 * 1000),
  },
  {
    id: '3',
    ticketNumber: 'TKT-2401-E5F6',
    subject: 'Payment not going through',
    description: 'My card keeps getting declined even though I have funds.',
    customer: { name: 'Mike Chen', email: 'mike@agency.co' },
    assignedTo: { name: 'Support Agent', email: 'agent@company.com' },
    status: 'WAITING',
    priority: 'URGENT',
    category: 'Billing',
    source: 'CHAT',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '4',
    ticketNumber: 'TKT-2401-G7H8',
    subject: 'Feature request: Dark mode',
    description: 'Would love to have a dark mode option for the dashboard.',
    customer: { name: 'Lisa Park', email: 'lisa@design.io' },
    assignedTo: null,
    status: 'OPEN',
    priority: 'LOW',
    category: 'Feature Request',
    source: 'WEB_FORM',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '5',
    ticketNumber: 'TKT-2401-I9J0',
    subject: 'API documentation unclear',
    description: 'The authentication section needs more examples.',
    customer: { name: 'David Lee', email: 'david@devshop.io' },
    assignedTo: null,
    status: 'OPEN',
    priority: 'MEDIUM',
    category: 'Technical',
    source: 'EMAIL',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '6',
    ticketNumber: 'TKT-2401-K1L2',
    subject: 'Thank you!',
    description: 'Just wanted to say the support has been amazing.',
    customer: { name: 'Emma Wilson', email: 'emma@startup.com' },
    assignedTo: null,
    status: 'RESOLVED',
    priority: 'LOW',
    category: 'General',
    source: 'CHAT',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
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

export default function TicketsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const stats = {
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    waiting: tickets.filter((t) => t.status === 'WAITING').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    urgent: tickets.filter((t) => t.priority === 'URGENT').length,
  }

  const categories = [...new Set(tickets.map((t) => t.category))]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and respond to customer support tickets.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Waiting</p>
          <p className="text-2xl font-bold text-purple-600">{stats.waiting}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Urgent</p>
          <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tickets..."
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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING">Waiting</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.ticketNumber}</p>
                    <p className="text-sm text-gray-500 max-w-xs truncate">{ticket.subject}</p>
                  </div>
                </td>
                <td>
                  <div>
                    <p className="text-gray-900">{ticket.customer.name}</p>
                    <p className="text-sm text-gray-500">{ticket.customer.email}</p>
                  </div>
                </td>
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
                <td className="text-gray-500">{ticket.category}</td>
                <td className="text-gray-500">
                  {ticket.assignedTo?.name || (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="text-gray-500">{formatRelativeTime(ticket.createdAt)}</td>
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

        {filteredTickets.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No tickets found</p>
          </div>
        )}
      </div>
    </div>
  )
}

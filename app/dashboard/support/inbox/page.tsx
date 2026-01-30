'use client'

import { useState } from 'react'
import { formatRelativeTime, getInitials } from '@/lib/utils'

// Demo data
const messages = [
  {
    id: '1',
    threadId: 'thread-1',
    from: 'john@startup.io',
    fromName: 'John Smith',
    subject: 'Question about API limits',
    preview: 'Hi there, I was wondering what the rate limits are for the API...',
    status: 'UNREAD',
    assignedTo: null,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '2',
    threadId: 'thread-2',
    from: 'sarah@techco.com',
    fromName: 'Sarah Johnson',
    subject: 'Re: Invoice #INV-2024-001',
    preview: 'Thanks for sending this over. I have a question about the line item...',
    status: 'READ',
    assignedTo: { name: 'Agent 1', email: 'agent1@company.com' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    threadId: 'thread-3',
    from: 'mike@agency.co',
    fromName: 'Mike Chen',
    subject: 'Partnership opportunity',
    preview: 'Hello! I\'m reaching out to explore a potential partnership...',
    status: 'UNREAD',
    assignedTo: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '4',
    threadId: 'thread-4',
    from: 'lisa@design.io',
    fromName: 'Lisa Park',
    subject: 'Feature feedback',
    preview: 'I\'ve been using the new dashboard and wanted to share some feedback...',
    status: 'REPLIED',
    assignedTo: { name: 'Agent 2', email: 'agent2@company.com' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    threadId: 'thread-5',
    from: 'david@devshop.io',
    fromName: 'David Lee',
    subject: 'Bug report: Export function',
    preview: 'Found an issue with the CSV export. When I try to export more than...',
    status: 'READ',
    assignedTo: { name: 'Agent 1', email: 'agent1@company.com' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

const statusColors: Record<string, string> = {
  UNREAD: 'bg-blue-100 text-blue-800',
  READ: 'bg-gray-100 text-gray-800',
  REPLIED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
}

export default function InboxPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null)
  const [replyText, setReplyText] = useState('')

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.from.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject.toLowerCase().includes(search.toLowerCase()) ||
      msg.preview.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    unread: messages.filter((m) => m.status === 'UNREAD').length,
    read: messages.filter((m) => m.status === 'READ').length,
    replied: messages.filter((m) => m.status === 'REPLIED').length,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shared Inbox</h1>
          <p className="text-gray-500 mt-1">Manage support emails in one place.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Unread</p>
          <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Awaiting Reply</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Replied</p>
          <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Message List */}
        <div className="card overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search messages..."
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
                <option value="all">All</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
                <option value="REPLIED">Replied</option>
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedMessage?.id === msg.id
                    ? 'bg-support-50'
                    : msg.status === 'UNREAD'
                    ? 'bg-blue-50/50 hover:bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-support-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-support-700">
                      {getInitials(msg.fromName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${msg.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'}`}>
                        {msg.fromName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {msg.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-1">{msg.preview}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge text-xs ${statusColors[msg.status]}`}>
                        {msg.status}
                      </span>
                      {msg.assignedTo && (
                        <span className="text-xs text-gray-500">
                          Assigned to {msg.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="card">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-900">{selectedMessage.subject}</h2>
                  <span className={`badge ${statusColors[selectedMessage.status]}`}>
                    {selectedMessage.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>From: {selectedMessage.fromName}</span>
                  <span>&lt;{selectedMessage.from}&gt;</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(selectedMessage.createdAt)}
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-gray-700">{selectedMessage.preview}</p>
                <p className="text-gray-700 mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                  veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-gray-200">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="input mb-3"
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select className="input py-1.5 text-sm">
                      <option>Assign to...</option>
                      <option>Agent 1</option>
                      <option>Agent 2</option>
                    </select>
                    <button className="btn btn-secondary text-sm">
                      Add Note
                    </button>
                  </div>
                  <button className="btn btn-support">
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

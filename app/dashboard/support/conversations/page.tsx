'use client'

import { useState } from 'react'
import { formatRelativeTime, getInitials } from '@/lib/utils'

// Demo data
const conversations = [
  {
    id: '1',
    sessionId: 'sess-123',
    customer: { name: 'Anonymous', email: null },
    status: 'ACTIVE',
    resolvedByBot: false,
    lastMessage: 'How do I reset my password?',
    messages: [
      { role: 'USER', content: 'Hello, I need help', time: '2 min ago' },
      { role: 'BOT', content: 'Hi! How can I help you today?', time: '2 min ago' },
      { role: 'USER', content: 'How do I reset my password?', time: '1 min ago' },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: '2',
    sessionId: 'sess-124',
    customer: { name: 'Maria Garcia', email: 'maria@company.com' },
    status: 'HANDED_OFF',
    resolvedByBot: false,
    lastMessage: 'I need to speak with a human please',
    messages: [
      { role: 'USER', content: 'This is ridiculous!', time: '10 min ago' },
      { role: 'BOT', content: 'I\'m sorry to hear you\'re frustrated. How can I help?', time: '10 min ago' },
      { role: 'USER', content: 'I need to speak with a human please', time: '5 min ago' },
      { role: 'BOT', content: 'I understand. Let me connect you with a support agent right away.', time: '5 min ago' },
    ],
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: '3',
    sessionId: 'sess-125',
    customer: { name: 'Alex Dev', email: 'alex@dev.io' },
    status: 'RESOLVED',
    resolvedByBot: true,
    lastMessage: 'Thanks, that worked!',
    messages: [
      { role: 'USER', content: 'Where can I find the API docs?', time: '15 min ago' },
      { role: 'BOT', content: 'You can find our API documentation at docs.example.com/api. Is there anything specific you\'re looking for?', time: '15 min ago' },
      { role: 'USER', content: 'Thanks, that worked!', time: '8 min ago' },
    ],
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '4',
    sessionId: 'sess-126',
    customer: { name: 'John Smith', email: 'john@startup.io' },
    status: 'ACTIVE',
    resolvedByBot: false,
    lastMessage: 'Can you explain the pricing tiers?',
    messages: [
      { role: 'USER', content: 'Hi, I have a question about pricing', time: '3 min ago' },
      { role: 'BOT', content: 'Of course! I\'d be happy to help with pricing questions. What would you like to know?', time: '3 min ago' },
      { role: 'USER', content: 'Can you explain the pricing tiers?', time: '1 min ago' },
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
  },
]

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  HANDED_OFF: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-gray-100 text-gray-800',
  ABANDONED: 'bg-yellow-100 text-yellow-800',
}

export default function ConversationsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState<typeof conversations[0] | null>(
    conversations[0]
  )
  const [agentMessage, setAgentMessage] = useState('')

  const filteredConversations = conversations.filter((conv) => {
    return statusFilter === 'all' || conv.status === statusFilter
  })

  const stats = {
    active: conversations.filter((c) => c.status === 'ACTIVE').length,
    handedOff: conversations.filter((c) => c.status === 'HANDED_OFF').length,
    resolved: conversations.filter((c) => c.status === 'RESOLVED').length,
    botResolved: conversations.filter((c) => c.resolvedByBot).length,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Conversations</h1>
          <p className="text-gray-500 mt-1">Monitor and join active chat sessions.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active Now</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Needs Human</p>
          <p className="text-2xl font-bold text-red-600">{stats.handedOff}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Resolved Today</p>
          <p className="text-2xl font-bold text-gray-600">{stats.resolved}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Bot Resolved</p>
          <p className="text-2xl font-bold text-support-600">{stats.botResolved}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="card overflow-hidden">
          {/* Filter */}
          <div className="p-4 border-b border-gray-200">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Conversations</option>
              <option value="ACTIVE">Active</option>
              <option value="HANDED_OFF">Needs Human</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-support-50'
                    : conv.status === 'HANDED_OFF'
                    ? 'bg-red-50/50 hover:bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-support-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-support-700">
                      {getInitials(conv.customer.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{conv.customer.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(conv.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge text-xs ${statusColors[conv.status]}`}>
                        {conv.status === 'HANDED_OFF' ? 'NEEDS HUMAN' : conv.status}
                      </span>
                      {conv.resolvedByBot && (
                        <span className="text-xs text-support-600">🤖 Bot resolved</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2 card flex flex-col h-[600px]">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-support-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-support-700">
                        {getInitials(selectedConversation.customer.name)}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.customer.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.customer.email || 'Anonymous visitor'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusColors[selectedConversation.status]}`}>
                      {selectedConversation.status === 'HANDED_OFF'
                        ? 'NEEDS HUMAN'
                        : selectedConversation.status}
                    </span>
                    {selectedConversation.status === 'HANDED_OFF' && (
                      <button className="btn btn-support text-sm">
                        Take Over
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedConversation.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'USER' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'USER'
                          ? 'bg-gray-100 text-gray-900'
                          : msg.role === 'BOT'
                          ? 'bg-support-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.role === 'USER' ? 'text-gray-500' : 'text-white/70'
                        }`}
                      >
                        {msg.role === 'BOT' ? '🤖 Bot' : msg.role === 'AGENT' ? '👤 Agent' : ''}{' '}
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              {selectedConversation.status !== 'RESOLVED' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={agentMessage}
                      onChange={(e) => setAgentMessage(e.target.value)}
                      placeholder="Type a message as agent..."
                      className="input flex-1"
                    />
                    <button className="btn btn-support">Send</button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Sending a message will take over the conversation from the bot.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to view
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

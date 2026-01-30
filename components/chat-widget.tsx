'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'bot' | 'agent'
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  organizationId: string
  primaryColor?: string
  position?: 'left' | 'right'
  greeting?: string
  botName?: string
  placeholder?: string
  showBranding?: boolean
  collectEmail?: boolean
}

export function ChatWidget({
  organizationId,
  primaryColor = '#8B5CF6',
  position = 'right',
  greeting = 'Hi there! How can we help you today?',
  botName = 'Support Assistant',
  placeholder = 'Type your message...',
  showBranding = true,
  collectEmail = true,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(!collectEmail)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate session ID
    if (!sessionId) {
      setSessionId(`sess-${Date.now()}-${Math.random().toString(36).substring(7)}`)
    }
  }, [sessionId])

  useEffect(() => {
    // Add greeting message when widget opens
    if (isOpen && messages.length === 0 && emailSubmitted) {
      setMessages([
        {
          id: '1',
          role: 'bot',
          content: greeting,
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, greeting, emailSubmitted, messages.length])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setEmailSubmitted(true)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          organizationId,
          customerEmail: email,
        }),
      })

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: data.handoff ? 'agent' : 'bot',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`fixed bottom-6 ${position === 'right' ? 'right-6' : 'left-6'} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '500px' }}
          >
            {/* Header */}
            <div
              className="p-4 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    🤖
                  </div>
                  <div>
                    <p className="font-semibold">{botName}</p>
                    <p className="text-sm opacity-80">Usually replies instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Email Collection */}
            {!emailSubmitted && (
              <form onSubmit={handleEmailSubmit} className="p-4 border-b">
                <p className="text-sm text-gray-600 mb-3">
                  Please enter your email so we can follow up if needed.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Start
                  </button>
                </div>
              </form>
            )}

            {/* Messages */}
            {emailSubmitted && (
              <>
                <div className="h-72 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                          {message.role === 'bot' ? '🤖' : '👤'}
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        style={message.role === 'user' ? { backgroundColor: primaryColor } : {}}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-2">
                        🤖
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="typing-indicator flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={placeholder}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="p-2 text-white rounded-lg disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  {showBranding && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Powered by Operations Hub
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default ChatWidget

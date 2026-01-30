'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-revenue-500 to-support-500" />
              <span className="text-white font-bold text-xl">Operations Hub</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Automate Your
              <br />
              <span className="bg-gradient-to-r from-revenue-400 to-support-400 bg-clip-text text-transparent">
                Operations
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Manage billing, recover failed payments, and provide 24/7 customer support
              without lifting a finger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn btn-revenue text-lg px-8 py-3">
                Open Dashboard
              </Link>
              <Link href="#features" className="btn btn-secondary text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Revenue Manager Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card bg-gray-800/50 border-gray-700 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl revenue-gradient flex items-center justify-center">
                  <span className="text-2xl">💚</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Revenue Manager</h2>
                  <p className="text-revenue-400">Automatic billing & payments</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Stripe integration for subscriptions & one-time payments',
                  'Automatic invoicing with your branding',
                  'Dunning system recovers failed payments',
                  'MRR, ARR, Churn, and LTV metrics',
                  'Revenue forecasting & predictions',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-revenue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/revenue" className="btn btn-revenue w-full">
                Open Revenue Manager
              </Link>
            </motion.div>

            {/* Support Bot Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card bg-gray-800/50 border-gray-700 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl support-gradient flex items-center justify-center">
                  <span className="text-2xl">💜</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Support Bot</h2>
                  <p className="text-support-400">24/7 AI-powered support</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Chat widget for your website',
                  'AI responds to common questions',
                  'Automatic ticket creation & routing',
                  'Knowledge base for self-service',
                  'Shared inbox for your team',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-support-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/support" className="btn btn-support w-full">
                Open Support Bot
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Connection Diagram */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Seamlessly Connected
          </h2>
          <p className="text-gray-400 mb-12">
            Revenue Manager and Support Bot work together to give you complete visibility.
          </p>
          <div className="flex items-center justify-center gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-24 h-24 rounded-2xl revenue-gradient flex items-center justify-center text-4xl"
            >
              💚
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-1 bg-revenue-500 rounded-full" />
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-revenue-500 to-support-500" />
              <div className="w-8 h-1 bg-support-500 rounded-full" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="w-24 h-24 rounded-2xl support-gradient flex items-center justify-center text-4xl"
            >
              💜
            </motion.div>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
            <div className="card bg-gray-800/50 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Payment Failed?</h3>
              <p className="text-gray-400 text-sm">
                Revenue Manager automatically creates a support ticket so you can follow up with the customer.
              </p>
            </div>
            <div className="card bg-gray-800/50 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Billing Question?</h3>
              <p className="text-gray-400 text-sm">
                Support Bot queries Revenue Manager data to answer "Why was I charged?" instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-revenue-500 to-support-500" />
            <span className="text-white font-bold text-xl">Operations Hub</span>
          </div>
          <p className="text-gray-500 text-sm">
            Automate your operations. Focus on growth.
          </p>
        </div>
      </footer>
    </div>
  )
}

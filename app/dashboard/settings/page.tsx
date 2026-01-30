'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const [settings, setSettings] = useState({
    general: {
      organizationName: 'My Company',
      website: 'https://mycompany.com',
      logo: '',
      timezone: 'America/New_York',
    },
    stripe: {
      secretKey: 'sk_test_****',
      publishableKey: 'pk_test_****',
      webhookSecret: 'whsec_****',
      connected: true,
    },
    email: {
      fromName: 'My Company Support',
      fromEmail: 'support@mycompany.com',
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
    },
    notifications: {
      paymentFailed: true,
      newSubscription: true,
      subscriptionCanceled: true,
      newTicket: true,
      ticketHandoff: true,
      slackWebhook: '',
    },
  })

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'stripe', name: 'Stripe' },
    { id: 'email', name: 'Email' },
    { id: 'notifications', name: 'Notifications' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your Operations Hub settings.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeTab === 'general' && (
            <div className="card p-6 space-y-6">
              <h2 className="font-semibold text-gray-900">General Settings</h2>
              <div>
                <label className="label">Organization Name</label>
                <input
                  type="text"
                  value={settings.general.organizationName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, organizationName: e.target.value },
                    })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="label">Website</label>
                <input
                  type="url"
                  value={settings.general.website}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, website: e.target.value },
                    })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="label">Logo URL</label>
                <input
                  type="url"
                  value={settings.general.logo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, logo: e.target.value },
                    })
                  }
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="label">Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: e.target.value },
                    })
                  }
                  className="input"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                </select>
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'stripe' && (
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Stripe Integration</h2>
                {settings.stripe.connected && (
                  <span className="badge bg-green-100 text-green-800">Connected</span>
                )}
              </div>
              <div>
                <label className="label">Secret Key</label>
                <input
                  type="password"
                  value={settings.stripe.secretKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stripe: { ...settings.stripe, secretKey: e.target.value },
                    })
                  }
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">Publishable Key</label>
                <input
                  type="text"
                  value={settings.stripe.publishableKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stripe: { ...settings.stripe, publishableKey: e.target.value },
                    })
                  }
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">Webhook Secret</label>
                <input
                  type="password"
                  value={settings.stripe.webhookSecret}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stripe: { ...settings.stripe, webhookSecret: e.target.value },
                    })
                  }
                  className="input font-mono"
                />
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Webhook Endpoint:</p>
                <code className="block bg-gray-100 p-3 rounded-lg text-sm">
                  https://yourdomain.com/api/webhooks/stripe
                </code>
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="card p-6 space-y-6">
              <h2 className="font-semibold text-gray-900">Email Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">From Name</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, fromName: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">From Email</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, fromEmail: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, smtpHost: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">SMTP Port</label>
                  <input
                    type="text"
                    value={settings.email.smtpPort}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6 space-y-6">
              <h2 className="font-semibold text-gray-900">Notification Settings</h2>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Revenue Notifications</h3>
                <label className="flex items-center justify-between">
                  <span>Payment failed</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.paymentFailed}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          paymentFailed: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-revenue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>New subscription</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.newSubscription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          newSubscription: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-revenue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Subscription canceled</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.subscriptionCanceled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          subscriptionCanceled: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-revenue-600 rounded"
                  />
                </label>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700">Support Notifications</h3>
                <label className="flex items-center justify-between">
                  <span>New ticket</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.newTicket}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          newTicket: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-support-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Ticket handoff requested</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.ticketHandoff}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          ticketHandoff: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-support-600 rounded"
                  />
                </label>
              </div>
              <div className="pt-4 border-t">
                <label className="label">Slack Webhook URL (optional)</label>
                <input
                  type="url"
                  value={settings.notifications.slackWebhook}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        slackWebhook: e.target.value,
                      },
                    })
                  }
                  className="input"
                  placeholder="https://hooks.slack.com/services/..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Receive notifications in your Slack channel
                </p>
              </div>
              <button onClick={handleSave} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

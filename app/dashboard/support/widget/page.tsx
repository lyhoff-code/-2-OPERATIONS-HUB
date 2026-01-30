'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ChatWidgetConfigPage() {
  const [config, setConfig] = useState({
    enabled: true,
    position: 'right',
    primaryColor: '#8B5CF6',
    greeting: 'Hi there! How can we help you today?',
    placeholder: 'Type your message...',
    botName: 'Support Assistant',
    botAvatar: '',
    showBranding: true,
    collectEmail: true,
    businessHours: {
      enabled: false,
      timezone: 'America/New_York',
      hours: {
        mon: { start: '09:00', end: '17:00', enabled: true },
        tue: { start: '09:00', end: '17:00', enabled: true },
        wed: { start: '09:00', end: '17:00', enabled: true },
        thu: { start: '09:00', end: '17:00', enabled: true },
        fri: { start: '09:00', end: '17:00', enabled: true },
        sat: { start: '09:00', end: '17:00', enabled: false },
        sun: { start: '09:00', end: '17:00', enabled: false },
      },
    },
    offlineMessage: "We're not available right now. Leave a message and we'll get back to you.",
  })

  const embedCode = `<!-- Support Bot Chat Widget -->
<script>
  window.SupportBotConfig = {
    organizationId: "your-org-id",
    primaryColor: "${config.primaryColor}",
    position: "${config.position}",
    greeting: "${config.greeting}",
    botName: "${config.botName}"
  };
</script>
<script src="https://cdn.operationshub.com/widget.js" async></script>`

  const handleSave = () => {
    toast.success('Widget configuration saved')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Widget</h1>
          <p className="text-gray-500 mt-1">Configure and embed the chat widget on your website.</p>
        </div>
        <button onClick={handleSave} className="btn btn-support">
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* General Settings */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Widget</p>
                  <p className="text-sm text-gray-500">Show the chat widget on your website</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-5 h-5 text-support-600 rounded"
                />
              </label>

              <div>
                <label className="label">Bot Name</label>
                <input
                  type="text"
                  value={config.botName}
                  onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Greeting Message</label>
                <textarea
                  value={config.greeting}
                  onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>

              <div>
                <label className="label">Input Placeholder</label>
                <input
                  type="text"
                  value={config.placeholder}
                  onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="input flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="label">Position</label>
                <select
                  value={config.position}
                  onChange={(e) => setConfig({ ...config, position: e.target.value })}
                  className="input"
                >
                  <option value="right">Bottom Right</option>
                  <option value="left">Bottom Left</option>
                </select>
              </div>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Branding</p>
                  <p className="text-sm text-gray-500">Display "Powered by Operations Hub"</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.showBranding}
                  onChange={(e) => setConfig({ ...config, showBranding: e.target.checked })}
                  className="w-5 h-5 text-support-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Behavior */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Behavior</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Collect Email</p>
                  <p className="text-sm text-gray-500">Ask visitors for their email before chatting</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.collectEmail}
                  onChange={(e) => setConfig({ ...config, collectEmail: e.target.checked })}
                  className="w-5 h-5 text-support-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-sm text-gray-500">Only show widget during business hours</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.businessHours.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      businessHours: { ...config.businessHours, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 text-support-600 rounded"
                />
              </label>

              <div>
                <label className="label">Offline Message</label>
                <textarea
                  value={config.offlineMessage}
                  onChange={(e) => setConfig({ ...config, offlineMessage: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Embed Code</h2>
              <button onClick={handleCopyCode} className="btn btn-secondary text-sm">
                Copy Code
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {embedCode}
            </pre>
            <p className="text-sm text-gray-500 mt-3">
              Add this code to your website's HTML, just before the closing &lt;/body&gt; tag.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="sticky top-8">
            <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="card p-6 bg-gray-100 min-h-[600px] relative">
              {/* Chat Widget Preview */}
              <div
                className={`absolute bottom-6 ${config.position === 'right' ? 'right-6' : 'left-6'}`}
              >
                {/* Chat Button */}
                <div
                  className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>

                {/* Chat Window Preview */}
                <div
                  className={`absolute bottom-16 ${
                    config.position === 'right' ? 'right-0' : 'left-0'
                  } w-80 bg-white rounded-xl shadow-2xl overflow-hidden`}
                >
                  {/* Header */}
                  <div
                    className="p-4 text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        🤖
                      </div>
                      <div>
                        <p className="font-semibold">{config.botName}</p>
                        <p className="text-sm opacity-80">Usually replies instantly</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 h-64 overflow-y-auto">
                    <div className="flex gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                        🤖
                      </div>
                      <div
                        className="max-w-[80%] rounded-lg px-3 py-2 text-sm text-white"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        {config.greeting}
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={config.placeholder}
                        className="input flex-1 text-sm"
                        disabled
                      />
                      <button
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </div>
                    {config.showBranding && (
                      <p className="text-xs text-center text-gray-400 mt-2">
                        Powered by Operations Hub
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

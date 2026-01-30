'use client'

import { useState } from 'react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

// Demo forecast data
const forecastData = {
  current: {
    mrr: 24500,
    customers: 156,
    churnRate: 2.3,
  },
  predictions: [
    { month: 'Feb 2024', mrr: 25800, customers: 164, confidence: 92 },
    { month: 'Mar 2024', mrr: 27200, customers: 172, confidence: 88 },
    { month: 'Apr 2024', mrr: 28700, customers: 181, confidence: 84 },
    { month: 'May 2024', mrr: 30300, customers: 190, confidence: 79 },
    { month: 'Jun 2024', mrr: 32000, customers: 199, confidence: 74 },
    { month: 'Jul 2024', mrr: 33800, customers: 209, confidence: 68 },
  ],
  scenarios: {
    optimistic: { mrr_6m: 38000, growth: 55 },
    realistic: { mrr_6m: 33800, growth: 38 },
    pessimistic: { mrr_6m: 28000, growth: 14 },
  },
}

const churnRiskCustomers = [
  {
    name: 'DataSystems',
    email: 'finance@datasystems.co',
    mrr: 299,
    risk: 0.78,
    factors: ['Payment failed 2x', 'No login in 14 days', 'Support ticket unresolved'],
  },
  {
    name: 'StartupABC',
    email: 'billing@startabc.io',
    mrr: 99,
    risk: 0.65,
    factors: ['Usage dropped 60%', 'Downgraded plan inquiry'],
  },
  {
    name: 'WebAgency',
    email: 'accounts@webagency.com',
    mrr: 599,
    risk: 0.52,
    factors: ['Competitor mention in support', 'Feature request denied'],
  },
]

export default function ForecastingPage() {
  const [timeframe, setTimeframe] = useState('6m')

  const getTimeframeData = () => {
    const months = timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : 12
    return forecastData.predictions.slice(0, months)
  }

  const predictions = getTimeframeData()
  const lastPrediction = predictions[predictions.length - 1]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Forecasting</h1>
          <p className="text-gray-500 mt-1">
            AI-powered predictions for your business growth.
          </p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="input w-auto"
        >
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="12m">12 Months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border-l-4 border-revenue-500">
          <p className="text-sm text-gray-500">Current MRR</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(forecastData.current.mrr)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {forecastData.current.customers} active customers
          </p>
        </div>
        <div className="card p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Projected MRR ({timeframe})</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(lastPrediction.mrr)}
          </p>
          <p className="text-sm text-green-600 mt-1">
            +{formatPercentage(((lastPrediction.mrr - forecastData.current.mrr) / forecastData.current.mrr) * 100)} growth
          </p>
        </div>
        <div className="card p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Confidence Level</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {lastPrediction.confidence}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Based on historical data</p>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="font-semibold text-gray-900">Monthly Projections</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Projected MRR</th>
                <th>Projected Customers</th>
                <th>Growth</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="bg-gray-50">
                <td className="font-medium text-gray-900">Jan 2024 (Current)</td>
                <td className="font-medium">{formatCurrency(forecastData.current.mrr)}</td>
                <td>{forecastData.current.customers}</td>
                <td>-</td>
                <td>
                  <span className="badge bg-gray-100 text-gray-800">Actual</span>
                </td>
              </tr>
              {predictions.map((pred, i) => {
                const prevMrr = i === 0 ? forecastData.current.mrr : predictions[i - 1].mrr
                const growth = ((pred.mrr - prevMrr) / prevMrr) * 100
                return (
                  <tr key={pred.month}>
                    <td className="font-medium text-gray-900">{pred.month}</td>
                    <td className="font-medium">{formatCurrency(pred.mrr)}</td>
                    <td>{pred.customers}</td>
                    <td className="text-green-600">+{formatPercentage(growth)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-revenue-500 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{pred.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <h3 className="font-semibold text-gray-900">Optimistic Scenario</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(forecastData.scenarios.optimistic.mrr_6m)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            +{forecastData.scenarios.optimistic.growth}% growth in 6 months
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Higher than expected new signups</li>
            <li>• Lower churn rate</li>
            <li>• More upgrades to higher tiers</li>
          </ul>
        </div>
        <div className="card p-6 ring-2 ring-revenue-500">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h3 className="font-semibold text-gray-900">Realistic Scenario</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(forecastData.scenarios.realistic.mrr_6m)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            +{forecastData.scenarios.realistic.growth}% growth in 6 months
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Current growth rate maintained</li>
            <li>• Stable churn rate</li>
            <li>• Average conversion rates</li>
          </ul>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <h3 className="font-semibold text-gray-900">Pessimistic Scenario</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(forecastData.scenarios.pessimistic.mrr_6m)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            +{forecastData.scenarios.pessimistic.growth}% growth in 6 months
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Slower new customer acquisition</li>
            <li>• Higher churn rate</li>
            <li>• More downgrades</li>
          </ul>
        </div>
      </div>

      {/* Churn Risk */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Churn Risk Alerts</h2>
            <p className="text-sm text-gray-500">Customers likely to cancel</p>
          </div>
          <span className="badge bg-red-100 text-red-800">
            {churnRiskCustomers.length} at risk
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {churnRiskCustomers.map((customer, i) => (
            <div key={i} className="p-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <span
                    className={`badge ${
                      customer.risk >= 0.7
                        ? 'bg-red-100 text-red-800'
                        : customer.risk >= 0.5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {Math.round(customer.risk * 100)}% risk
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {customer.email} • {formatCurrency(customer.mrr)}/mo
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {customer.factors.map((factor, j) => (
                    <span key={j} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-secondary text-sm">
                Reach Out
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

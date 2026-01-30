'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

// Demo data
const coupons = [
  {
    id: '1',
    code: 'WELCOME20',
    name: 'Welcome Discount',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxRedemptions: 100,
    redemptions: 45,
    validFrom: '2024-01-01',
    validUntil: '2024-03-31',
    active: true,
    plans: ['Basic', 'Pro'],
  },
  {
    id: '2',
    code: 'ANNUAL50',
    name: 'Annual Plan Discount',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50,
    maxRedemptions: null,
    redemptions: 23,
    validFrom: '2024-01-01',
    validUntil: null,
    active: true,
    plans: ['Enterprise'],
  },
  {
    id: '3',
    code: 'BLACKFRIDAY',
    name: 'Black Friday Special',
    discountType: 'PERCENTAGE',
    discountValue: 40,
    maxRedemptions: 500,
    redemptions: 500,
    validFrom: '2023-11-24',
    validUntil: '2023-11-27',
    active: false,
    plans: ['Basic', 'Pro', 'Enterprise'],
  },
  {
    id: '4',
    code: 'STARTUP',
    name: 'Startup Program',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    maxRedemptions: 50,
    redemptions: 12,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    active: true,
    plans: ['Pro'],
  },
]

export default function CouponsPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<typeof coupons[0] | null>(null)

  const handleEdit = (coupon: typeof coupons[0]) => {
    setEditingCoupon(coupon)
    setShowModal(true)
  }

  const handleSave = () => {
    toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created')
    setShowModal(false)
    setEditingCoupon(null)
  }

  const handleToggle = (coupon: typeof coupons[0]) => {
    toast.success(`Coupon ${coupon.active ? 'deactivated' : 'activated'}`)
  }

  const stats = {
    active: coupons.filter((c) => c.active).length,
    totalRedemptions: coupons.reduce((sum, c) => sum + c.redemptions, 0),
    totalSavings: coupons.reduce((sum, c) => {
      const avgDiscount = c.discountType === 'PERCENTAGE' ? (299 * c.discountValue) / 100 : c.discountValue
      return sum + avgDiscount * c.redemptions
    }, 0),
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-500 mt-1">Create and manage promotional codes.</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null)
            setShowModal(true)
          }}
          className="btn btn-revenue"
        >
          Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active Coupons</p>
          <p className="text-2xl font-bold text-revenue-600">{stats.active}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Redemptions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRedemptions}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Customer Savings</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSavings)}</p>
        </div>
      </div>

      {/* Coupon List */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Redemptions</th>
              <th>Valid Period</th>
              <th>Plans</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>
                  <div>
                    <p className="font-mono font-medium text-gray-900">{coupon.code}</p>
                    <p className="text-sm text-gray-500">{coupon.name}</p>
                  </div>
                </td>
                <td className="font-medium text-revenue-600">
                  {coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue}%`
                    : formatCurrency(coupon.discountValue)}
                </td>
                <td>
                  <div>
                    <p className="text-gray-900">{coupon.redemptions}</p>
                    {coupon.maxRedemptions && (
                      <p className="text-sm text-gray-500">of {coupon.maxRedemptions} max</p>
                    )}
                  </div>
                </td>
                <td className="text-gray-500">
                  <div>
                    <p>From {formatDate(coupon.validFrom)}</p>
                    {coupon.validUntil ? (
                      <p>Until {formatDate(coupon.validUntil)}</p>
                    ) : (
                      <p className="text-green-600">No expiration</p>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {coupon.plans.map((plan) => (
                      <span key={plan} className="badge bg-gray-100 text-gray-700 text-xs">
                        {plan}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`badge ${
                      coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {coupon.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-revenue-600 hover:text-revenue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(coupon)}
                      className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                    >
                      {coupon.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">Coupon Code</label>
                <input
                  type="text"
                  className="input font-mono"
                  defaultValue={editingCoupon?.code}
                  placeholder="e.g., SUMMER20"
                />
              </div>
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  className="input"
                  defaultValue={editingCoupon?.name}
                  placeholder="e.g., Summer Sale Discount"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Discount Type</label>
                  <select className="input" defaultValue={editingCoupon?.discountType || 'PERCENTAGE'}>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="label">Discount Value</label>
                  <input
                    type="number"
                    className="input"
                    defaultValue={editingCoupon?.discountValue}
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valid From</label>
                  <input
                    type="date"
                    className="input"
                    defaultValue={editingCoupon?.validFrom}
                  />
                </div>
                <div>
                  <label className="label">Valid Until (optional)</label>
                  <input
                    type="date"
                    className="input"
                    defaultValue={editingCoupon?.validUntil || ''}
                  />
                </div>
              </div>
              <div>
                <label className="label">Max Redemptions (optional)</label>
                <input
                  type="number"
                  className="input"
                  defaultValue={editingCoupon?.maxRedemptions || ''}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <label className="label">Applicable Plans</label>
                <div className="flex gap-3 mt-2">
                  {['Basic', 'Pro', 'Enterprise'].map((plan) => (
                    <label key={plan} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={editingCoupon?.plans.includes(plan)}
                        className="w-4 h-4 text-revenue-600 rounded"
                      />
                      <span className="text-sm">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-revenue">
                {editingCoupon ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

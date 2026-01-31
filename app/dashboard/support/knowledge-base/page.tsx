'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatNumber, formatDate } from '@/lib/utils'

// Demo data
const articles = [
  {
    id: '1',
    title: 'How to reset your password',
    slug: 'how-to-reset-your-password',
    excerpt: 'Step-by-step guide to resetting your account password.',
    category: 'Account',
    status: 'PUBLISHED',
    viewCount: 1234,
    helpfulCount: 89,
    notHelpfulCount: 12,
    publishedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Understanding your billing',
    slug: 'understanding-your-billing',
    excerpt: 'Learn how billing works, when you\'re charged, and how to update payment methods.',
    category: 'Billing',
    status: 'PUBLISHED',
    viewCount: 987,
    helpfulCount: 72,
    notHelpfulCount: 8,
    publishedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Getting started guide',
    slug: 'getting-started-guide',
    excerpt: 'Everything you need to know to get up and running.',
    category: 'Getting Started',
    status: 'PUBLISHED',
    viewCount: 2341,
    helpfulCount: 156,
    notHelpfulCount: 23,
    publishedAt: '2023-12-01',
  },
  {
    id: '4',
    title: 'API Authentication',
    slug: 'api-authentication',
    excerpt: 'How to authenticate your API requests using tokens.',
    category: 'Technical',
    status: 'PUBLISHED',
    viewCount: 567,
    helpfulCount: 45,
    notHelpfulCount: 5,
    publishedAt: '2024-01-05',
  },
  {
    id: '5',
    title: 'Upgrading your plan',
    slug: 'upgrading-your-plan',
    excerpt: 'How to upgrade, downgrade, or change your subscription plan.',
    category: 'Billing',
    status: 'DRAFT',
    viewCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    publishedAt: null,
  },
  {
    id: '6',
    title: 'Team management',
    slug: 'team-management',
    excerpt: 'Adding, removing, and managing team members and permissions.',
    category: 'Account',
    status: 'PUBLISHED',
    viewCount: 432,
    helpfulCount: 34,
    notHelpfulCount: 3,
    publishedAt: '2024-01-08',
  },
]

const categories = Array.from(new Set(articles.map((a) => a.category)))

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
}

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === 'PUBLISHED').length,
    drafts: articles.filter((a) => a.status === 'DRAFT').length,
    totalViews: articles.reduce((sum, a) => sum + a.viewCount, 0),
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 mt-1">Create and manage help articles for customers.</p>
        </div>
        <Link href="/dashboard/support/knowledge-base/new" className="btn btn-support">
          New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Articles</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">{stats.drafts}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Views</p>
          <p className="text-2xl font-bold text-support-600">{formatNumber(stats.totalViews)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="grid gap-4">
        {filteredArticles.map((article) => (
          <div key={article.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${statusColors[article.status]}`}>
                    {article.status}
                  </span>
                  <span className="badge bg-gray-100 text-gray-700">{article.category}</span>
                </div>
                <Link
                  href={`/dashboard/support/knowledge-base/${article.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-support-600"
                >
                  {article.title}
                </Link>
                <p className="text-gray-500 mt-1">{article.excerpt}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatNumber(article.viewCount)} views
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    {article.helpfulCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    {article.notHelpfulCount}
                  </span>
                  {article.publishedAt && (
                    <span>Published {formatDate(article.publishedAt)}</span>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/support/knowledge-base/${article.id}/edit`}
                className="btn btn-secondary text-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-gray-500">No articles found</p>
          </div>
        )}
      </div>
    </div>
  )
}

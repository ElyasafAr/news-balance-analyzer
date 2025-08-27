'use client'

import { useState } from 'react'
import NewsAnalyzer from '@/components/NewsAnalyzer'
import NewsAggregator from '@/components/NewsAggregator'
import NewsFeed from '@/components/NewsFeed'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'aggregator' | 'feed'>('feed')

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          מנתח איזון חדשות
        </h1>
        <p className="text-lg text-gray-600">
          ניתוח איזון חדשות וסיכומים מאוזנים ממקורות מרובים
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-lg p-1 flex space-x-1 space-x-reverse">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'feed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            פיד חדשות
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analyzer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            ניתוח מאמרים
          </button>
          <button
            onClick={() => setActiveTab('aggregator')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'aggregator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            אגרגטור חדשות
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'feed' ? (
        <NewsFeed />
      ) : activeTab === 'analyzer' ? (
        <NewsAnalyzer />
      ) : (
        <NewsAggregator />
      )}
    </div>
  )
}


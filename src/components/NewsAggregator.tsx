'use client'

import { useState, useEffect } from 'react'

interface NewsEvent {
  id: string
  title: string
  description?: string
  source: string
  url?: string
  publishedAt: string
  createdAt: string
  newsArticles: NewsArticle[]
  summary?: BalancedSummary
}

interface NewsArticle {
  id: string
  title: string
  content: string
  url: string
  source: string
  publishedAt?: string
}

interface BalancedSummary {
  id: string
  summary: string
  viewpoints: string
  biasScore: number
  confidence: number
}

export default function NewsAggregator() {
  const [events, setEvents] = useState<NewsEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/news-events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setLastUpdate(data.lastUpdate)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startProcessing = async () => {
    try {
      setIsProcessing(true)
      const response = await fetch('/api/news-events/process', {
        method: 'POST'
      })
      
      if (response.ok) {
        // Wait a bit then refresh
        setTimeout(() => {
          fetchEvents()
        }, 5000)
      }
    } catch (error) {
      console.error('Error starting processing:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBiasColor = (score: number) => {
    if (score >= 3) return 'text-red-600'
    if (score <= -3) return 'text-blue-600'
    return 'text-green-600'
  }

  const getBiasLabel = (score: number) => {
    if (score >= 3) return 'מוטה ימינה'
    if (score <= -3) return 'מוטה שמאלה'
    return 'מאוזן'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">טוען אירועי חדשות...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            אגרגטור חדשות מאוזן
          </h2>
          <div className="text-sm text-gray-500">
            עדכון אחרון: {lastUpdate ? formatDate(lastUpdate) : 'לא עודכן'}
          </div>
        </div>
        
        <div className="flex space-x-reverse space-x-4">
          <button
            onClick={startProcessing}
            disabled={isProcessing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'מעבד...' : 'התחל עיבוד חדשות'}
          </button>
          
          <button
            onClick={fetchEvents}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            רענן
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-3">
          כלי זה אוסף אירועי חדשות מ-Rotter.net ומאתר מקורות חדשות ישראלים נוספים כדי ליצור סיכומים מאוזנים
        </p>
      </div>

      {/* Events Feed */}
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 mb-4">אין אירועי חדשות זמינים כרגע</p>
          <button
            onClick={startProcessing}
            disabled={isProcessing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'מעבד...' : 'התחל איסוף חדשות'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-lg p-6">
              {/* Event Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-gray-600 mb-2">{event.description}</p>
                )}
                <div className="flex items-center space-x-reverse space-x-4 text-sm text-gray-500">
                  <span>מקור: {event.source}</span>
                  <span>פורסם: {formatDate(event.publishedAt)}</span>
                  {event.url && (
                    <a 
                      href={event.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      צפה במקור
                    </a>
                  )}
                </div>
              </div>

              {/* Balanced Summary */}
              {event.summary && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">סיכום מאוזן:</h4>
                  <p className="text-gray-700 mb-3">{event.summary.summary}</p>
                  
                  <div className="flex items-center space-x-reverse space-x-4 text-sm">
                    <span className={`font-medium ${getBiasColor(event.summary.biasScore)}`}>
                      {getBiasLabel(event.summary.biasScore)}
                    </span>
                    <span className="text-gray-600">
                      ציון הטיה: {event.summary.biasScore.toFixed(1)}/10
                    </span>
                    <span className="text-gray-600">
                      רמת ביטחון: {(event.summary.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* News Sources */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  מקורות חדשות ({event.newsArticles.length}):
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.newsArticles.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-gray-800 mb-2">{article.title}</h5>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{article.source}</span>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          קרא עוד
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

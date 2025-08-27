'use client'

import { useState } from 'react'
import { analyzeArticle } from '@/lib/openai'

interface AnalysisResult {
  balanceScore: number
  politicalBias: {
    leaning: string
    confidence: string
    explanation: string
  }
  missingStakeholders: string[]
  uncoveredAngles: string[]
  sourceDiversity: {
    assessment: string
    sourceTypes: string[]
    balance: string
  }
  journalistQuestions: string[]
  analysis: string
  journalisticQuality: {
    overallScore: number;
    titleContentMatch: {
      score: number;
      explanation: string;
      examples: string[];
      suggestions: string[];
    };
    evidenceQuality: {
      score: number;
      explanation: string;
      examples: string[];
      suggestions: string[];
    };
    perspectiveBalance: {
      score: number;
      explanation: string;
      examples: string[];
      suggestions: string[];
    };
    emotionalLanguage: {
      score: number;
      explanation: string;
      examples: string[];
      suggestions: string[];
    };
    factualFoundation: {
      score: number;
      explanation: string;
      examples: string[];
      suggestions: string[];
    };
    storyCompleteness: {
      score: number;
      explanation: string;
      examples: string[];
      suggestions: string[];
    };
  };
}

export default function NewsAnalyzer() {
  const [article, setArticle] = useState('')
  const [articleUrl, setArticleUrl] = useState('')
  const [inputMethod, setInputMethod] = useState<'url' | 'text'>('url') // Changed default to 'url'
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!article.trim()) {
      setError('אנא הכנס מאמר לניתוח')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const analysis = await analyzeArticle(article)
      setResult(analysis)
         } catch (err) {
       console.error('Analysis error:', err)
       const errorMessage = err instanceof Error ? err.message : 'נכשל בניתוח המאמר'
       setError(`שגיאה בניתוח: ${errorMessage}`)
     } finally {
      setIsAnalyzing(false)
    }
  }

  const fetchArticleFromUrl = async (url: string) => {
    setIsFetching(true)
    setError('')
    
    try {
      const response = await fetch('/api/fetch-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setArticle(data.content)
      setInputMethod('text')
      setArticleUrl(url)
      
    } catch (err) {
      console.error('Fetch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch article'
      setError(`שגיאה בקבלת המאמר: ${errorMessage}`)
    } finally {
      setIsFetching(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setArticleUrl(url)
    setError(null)
    setResult(null)
    
    // Auto-analyze if URL is valid and not empty
    if (url.trim() && isValidUrl(url.trim())) {
      // Small delay to avoid analyzing while user is still typing
      const timeoutId = setTimeout(() => {
        if (url.trim() === articleUrl.trim()) {
          handleAnalyze()
        }
      }, 1000) // 1 second delay
      
      return () => clearTimeout(timeoutId)
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    if (score >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'מאוזן מאוד'
    if (score >= 6) return 'מאוזן בינונית'
    if (score >= 4) return 'מוטה במקצת'
    return 'מוטה מאוד'
  }

  const handleFetchArticle = async () => {
    if (!articleUrl.trim() || !isValidUrl(articleUrl.trim())) {
      setError('אנא הזן קישור תקין למאמר')
      return
    }
    await fetchArticleFromUrl(articleUrl)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          ניתוח מאמר חדשות
        </h2>
        
          {/* Input Method Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-200 rounded-lg p-1 flex space-x-1 space-x-reverse">
              <button
                onClick={() => setInputMethod('url')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMethod === 'url'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                הזן קישור
              </button>
              <button
                onClick={() => setInputMethod('text')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMethod === 'text'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                הדבק טקסט
              </button>
            </div>
          </div>

          {/* URL Input */}
          {inputMethod === 'url' && (
            <div className="mb-6">
              <div className="flex space-x-reverse space-x-4 items-center">
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="הדבק כאן את קישור המאמר..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleFetchArticle}
                  disabled={!articleUrl.trim() || isFetching}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isFetching ? 'מקבל מאמר...' : 'קבל מאמר'}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2 text-right">{error}</p>
              )}
            </div>
          )}

          {/* Text Input */}
          {inputMethod === 'text' && (
            <div className="mb-6">
              <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="הדבק כאן את טקסט המאמר לניתוח..."
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>
          )}
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Analyze Button */}
        {article && (
          <div className="text-center mb-6">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isFetching}
              className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isAnalyzing ? 'מנתח...' : isFetching ? 'מקבל מאמר...' : 'נתח מאמר'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            תוצאות הניתוח
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Balance Score */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                ציון איזון
              </h3>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(result.balanceScore)} mb-2`}>
                  {result.balanceScore}/10
                </div>
                <div className="text-gray-600 font-medium">
                  {getScoreLabel(result.balanceScore)}
                </div>
              </div>
            </div>

            {/* Political Bias */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                הטיה פוליטית
              </h3>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  result.politicalBias.leaning === 'left' ? 'text-blue-600' :
                  result.politicalBias.leaning === 'right' ? 'text-red-600' :
                  'text-green-600'
                } mb-2`}>
                  {result.politicalBias.leaning === 'left' ? 'שמאל' :
                   result.politicalBias.leaning === 'right' ? 'ימין' :
                   result.politicalBias.leaning === 'center' ? 'מרכז' :
                   result.politicalBias.leaning.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  רמת ביטחון: {result.politicalBias.confidence === 'high' ? 'גבוהה' :
                               result.politicalBias.confidence === 'medium' ? 'בינונית' :
                               result.politicalBias.confidence === 'low' ? 'נמוכה' :
                               result.politicalBias.confidence}
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {result.politicalBias.explanation}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Missing Stakeholders */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                בעלי עניין חסרים
              </h3>
              {result.missingStakeholders.length > 0 ? (
                <ul className="space-y-2">
                  {result.missingStakeholders.map((stakeholder, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 ml-2">•</span>
                      <span className="text-gray-700">{stakeholder}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 font-medium">כל בעלי העניין העיקריים כלולים</p>
              )}
            </div>

            {/* Source Diversity */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                מגוון מקורות
              </h3>
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  הערכה: {result.sourceDiversity.assessment}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  איזון: {result.sourceDiversity.balance}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <strong>סוגי מקורות:</strong>
                <ul className="mt-1 space-y-1">
                  {result.sourceDiversity.sourceTypes.map((type, index) => (
                    <li key={index} className="mr-2">• {type}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Uncovered Angles */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                זוויות לא מכוסות
              </h3>
              {result.uncoveredAngles.length > 0 ? (
                <ul className="space-y-2">
                  {result.uncoveredAngles.map((angle, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 ml-2">•</span>
                      <span className="text-gray-700">{angle}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-600 font-medium">זוויות הסיפור מכוסות היטב</p>
              )}
            </div>

            {/* Journalist Questions */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                שאלות שהעיתונאי צריך לשאול
              </h3>
              <ul className="space-y-2">
                {result.journalistQuestions.map((question, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 ml-2">{index + 1}.</span>
                    <span className="text-gray-700">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="mt-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              ניתוח מפורט
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
            </div>
          </div>

          {/* Journalistic Quality Analysis */}
          <div className="mt-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              איכות עיתונאית
            </h3>
            
            {/* Overall Score */}
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-blue-800 mb-2">
                  ציון איכות עיתונאית כללי
                </h4>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {result.journalisticQuality.overallScore}/10
                </div>
                <p className="text-blue-700">
                  ממוצע של כל הפרמטרים להלן
                </p>
              </div>
            </div>

            {/* Quality Parameters Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Title-Content Match */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  התאמת כותרת לתוכן
                </h4>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {result.journalisticQuality.titleContentMatch.score}/10
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {result.journalisticQuality.titleContentMatch.explanation}
                </p>
                <div className="text-xs text-gray-500">
                  <strong>דוגמאות:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.titleContentMatch.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>הצעות לשיפור:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.titleContentMatch.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evidence Quality */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  איכות ראיות
                </h4>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {result.journalisticQuality.evidenceQuality.score}/10
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {result.journalisticQuality.evidenceQuality.explanation}
                </p>
                <div className="text-xs text-gray-500">
                  <strong>דוגמאות:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.evidenceQuality.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>הצעות לשיפור:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.evidenceQuality.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Perspective Balance */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  איזון נקודות מבט
                </h4>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {result.journalisticQuality.perspectiveBalance.score}/10
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {result.journalisticQuality.perspectiveBalance.explanation}
                </p>
                <div className="text-xs text-gray-500">
                  <strong>דוגמאות:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.perspectiveBalance.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>הצעות לשיפור:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.perspectiveBalance.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Emotional Language */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  שפה רגשית vs אובייקטיבית
                </h4>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {result.journalisticQuality.emotionalLanguage.score}/10
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {result.journalisticQuality.emotionalLanguage.explanation}
                </p>
                <div className="text-xs text-gray-500">
                  <strong>דוגמאות:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.emotionalLanguage.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>הצעות לשיפור:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.emotionalLanguage.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Factual Foundation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  בסיס עובדתי
                </h4>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {result.journalisticQuality.factualFoundation.score}/10
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {result.journalisticQuality.factualFoundation.explanation}
                </p>
                <div className="text-xs text-gray-500">
                  <strong>דוגמאות:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.factualFoundation.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>הצעות לשיפור:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.factualFoundation.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Story Completeness */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">
                  שלמות הסיפור
                </h4>
                <div className="text-2xl font-bold text-indigo-600 mb-2">
                  {result.journalisticQuality.storyCompleteness.score}/10
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {result.journalisticQuality.storyCompleteness.explanation}
                </p>
                <div className="text-xs text-gray-500">
                  <strong>דוגמאות:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.storyCompleteness.examples.map((example, index) => (
                      <li key={index}>• {example}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>הצעות לשיפור:</strong>
                  <ul className="mt-1 space-y-1">
                    {result.journalisticQuality.storyCompleteness.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Article Display */}
          {article && (
            <div className="mt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                טקסט המאמר שנותח
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {article.length > 12000 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>המאמר קוצר:</strong> המאמר המקורי היה ארוך מדי ({article.length} תווים) ולכן קוצר ל-12000 תווים לצורך הניתוח. הניתוח עשוי להיות חלקי.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article}
                </p>
                {articleUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      <strong>מקור:</strong> <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{articleUrl}</a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  )
}

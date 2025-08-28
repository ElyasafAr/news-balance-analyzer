export interface AnalysisResult {
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
    overallScore: number
    titleContentMatch: {
      score: number
      explanation: string
      examples: string[]
      suggestions: string[]
    }
    evidenceQuality: {
      score: number
      explanation: string
      examples: string[]
      suggestions: string[]
    }
    perspectiveBalance: {
      score: number
      explanation: string
      examples: string[]
      suggestions: string[]
    }
    emotionalLanguage: {
      score: number
      explanation: string
      examples: string[]
      suggestions: string[]
    }
    factualFoundation: {
      score: number
      explanation: string
      examples: string[]
      suggestions: string[]
    }
    storyCompleteness: {
      score: number
      explanation: string
      examples: string[]
      suggestions: string[]
    }
  }
}

export async function analyzeArticle(article: string): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze article')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Analysis error:', error)
    throw new Error('נכשל בניתוח המאמר. אנא בדוק את מפתח ה-API שלך ונסה שוב.')
  }
}

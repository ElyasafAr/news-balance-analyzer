import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Note: removed NEXT_PUBLIC_ prefix
})

export async function POST(request: NextRequest) {
  try {
    const { article } = await request.json()
    
    if (!article) {
      return NextResponse.json({ error: 'Article is required' }, { status: 400 })
    }

    // Limit article length to prevent token limit issues
    const maxArticleLength = 12000 // characters (increased from 6000)
    let truncatedArticle = article
    
    if (article.length > maxArticleLength) {
      truncatedArticle = article.substring(0, maxArticleLength) + '... [המאמר קוצר בגלל אורכו]'
      console.log(`Article truncated from ${article.length} to ${truncatedArticle.length} characters`)
    }

    const prompt = `You are an expert news analyst specializing in media bias detection and balance assessment. Analyze the following news article thoroughly and provide a comprehensive analysis in Hebrew (עברית).

ANALYSIS CRITERIA:

1. **TITLE-CONTENT MATCH (1-10)**: 
   - 10: Headline perfectly reflects article content
   - 8-9: Headline accurately represents main points
   - 6-7: Headline somewhat matches content
   - 4-5: Headline partially misleading
   - 1-3: Headline significantly misrepresents content

2. **EVIDENCE QUALITY (1-10)**:
   - 10: Strong primary sources, verified facts
   - 8-9: Good mix of primary and secondary sources
   - 6-7: Some primary sources, some speculation
   - 4-5: Mostly secondary sources, limited verification
   - 1-3: Heavy speculation, few verified facts

3. **PERSPECTIVE BALANCE (1-10)**:
   - 10: Multiple balanced viewpoints represented
   - 8-9: Good representation of main perspectives
   - 6-7: Some viewpoints covered, some missing
   - 4-5: Limited perspective diversity
   - 1-3: One-sided coverage, missing viewpoints

4. **EMOTIONAL vs NEUTRAL LANGUAGE (1-10)**:
   - 10: Completely objective, neutral reporting
   - 8-9: Mostly neutral with minimal emotional language
   - 6-7: Some emotional language, mostly objective
   - 4-5: Significant emotional language, bias evident
   - 1-3: Highly emotional, subjective language

5. **FACTUAL FOUNDATION (1-10)**:
   - 10: All claims verified with evidence
   - 8-9: Most claims verified, few unsubstantiated
   - 6-7: Some verified facts, some unverified claims
   - 4-5: Many unsubstantiated claims
   - 1-3: Mostly unverified claims, weak factual basis

6. **STORY COMPLETENESS (1-10)**:
   - 10: Covers all 6 W's (who/what/when/where/why/how)
   - 8-9: Covers 5-6 W's well
   - 6-7: Covers 4-5 W's adequately
   - 4-5: Covers 3-4 W's, missing important details
   - 1-3: Covers 1-2 W's, major gaps in coverage

Article to analyze: ${truncatedArticle}

RESPONSE FORMAT: Return ONLY valid JSON in this exact structure:
{
  "balanceScore": [number 1-10],
  "politicalBias": {
    "leaning": "left/right/center",
    "confidence": "high/medium/low",
    "explanation": "[Hebrew explanation of bias indicators found]"
  },
  "missingStakeholders": ["[Hebrew list of missing voices]"],
  "uncoveredAngles": ["[Hebrew list of missing story angles]"],
  "sourceDiversity": {
    "assessment": "[Hebrew overall assessment]",
    "sourceTypes": ["[Hebrew list of source types used]"],
    "balance": "[Hebrew description of source balance]"
  },
  "journalistQuestions": [
    "[Hebrew question 1]",
    "[Hebrew question 2]",
    "[Hebrew question 3]"
  ],
  "analysis": "[Hebrew comprehensive analysis explaining the score and key findings]",
  "journalisticQuality": {
    "overallScore": [number 1-10],
    "titleContentMatch": {
      "score": [number 1-10],
      "explanation": "[Hebrew explanation]",
      "examples": ["[Hebrew specific examples from text]"],
      "suggestions": ["[Hebrew improvement suggestions]"]
    },
    "evidenceQuality": {
      "score": [number 1-10],
      "explanation": "[Hebrew explanation]",
      "examples": ["[Hebrew specific examples from text]"],
      "suggestions": ["[Hebrew improvement suggestions]"]
    },
    "perspectiveBalance": {
      "score": [number 1-10],
      "explanation": "[Hebrew explanation]",
      "examples": ["[Hebrew specific examples from text]"],
      "suggestions": ["[Hebrew improvement suggestions]"]
    },
    "emotionalLanguage": {
      "score": [number 1-10],
      "explanation": "[Hebrew explanation]",
      "examples": ["[Hebrew specific examples from text]"],
      "suggestions": ["[Hebrew improvement suggestions]"]
    },
    "factualFoundation": {
      "score": [number 1-10],
      "explanation": "[Hebrew explanation]",
      "examples": ["[Hebrew specific examples from text]"],
      "suggestions": ["[Hebrew improvement suggestions]"]
    },
    "storyCompleteness": {
      "score": [number 1-10],
      "explanation": "[Hebrew explanation]",
      "examples": ["[Hebrew specific examples from text]"],
      "suggestions": ["[Hebrew improvement suggestions]"]
    }
  }
}

IMPORTANT: 
- Respond with ONLY the JSON object
- No markdown, no explanations, no additional text
- Start with { and end with }
- Use specific, concrete examples from the article
- Be objective and analytical, not opinionated
- Calculate overall score as average of all 6 parameters
- Ensure all Hebrew text is properly encoded
- Do not include any text before or after the JSON object
- The response must be valid JSON that can be parsed directly
- Keep explanations concise to avoid token limits`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "אתה מומחה בכיר לניתוח חדשות וזיהוי הטיה תקשורתית. התמחותך כוללת: זיהוי הטיה פוליטית, הערכת איזון מקורות, זיהוי נקודות מבט חסרות, וניתוח איכות עיתונאית. אתה מנתח מאמרים באופן אובייקטיבי ומדעי, תוך שימוש בקריטריונים ברורים ומדידים. תמיד תן ניתוח מפורט ומבוסס ראיות בעברית. CRITICAL: You must respond with ONLY valid JSON. No text before or after. No markdown. Just the JSON object starting with { and ending with }."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1, // Lower temperature for more consistent JSON
      max_tokens: 2500, // Increased token limit
    })

    let response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // If the response is clearly not JSON, try with gpt-3.5-turbo as fallback
    if (!response.trim().startsWith('{') || !response.trim().endsWith('}')) {
      console.log('Response is not JSON, trying with gpt-3.5-turbo fallback...')
      
      try {
        const fallbackCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a news analyst. Respond with ONLY valid JSON. No text before or after. No markdown. Just the JSON object starting with { and ending with }."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000,
        })
        
        const fallbackResponse = fallbackCompletion.choices[0]?.message?.content
        if (fallbackResponse && fallbackResponse.trim().startsWith('{') && fallbackResponse.trim().endsWith('}')) {
          console.log('Fallback model succeeded, using its response')
          // Use the fallback response instead
          response = fallbackResponse
        }
      } catch (fallbackError) {
        console.log('Fallback model also failed:', fallbackError)
        // Continue with original response
      }
    }

    // Try to parse the JSON response
    try {
      // Clean the response - remove any markdown formatting
      let cleanResponse = response.trim()
      
      // Remove markdown code blocks if present
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '')
      }
      
      // Try to find JSON content between curly braces
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanResponse = jsonMatch[0]
      }
      
      console.log('Cleaned response:', cleanResponse)
      console.log('Response length:', cleanResponse.length)
      
      // Try to fix common JSON issues
      let fixedResponse = cleanResponse
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      
      console.log('Fixed response:', fixedResponse)
      
      const parsed = JSON.parse(fixedResponse)
      console.log('Parsed result:', parsed)
      
      // Validate that we have the required structure
      if (!parsed.journalisticQuality) {
        throw new Error('Missing journalisticQuality in response')
      }
      
      return NextResponse.json({
        balanceScore: parsed.balanceScore || 5,
        politicalBias: parsed.politicalBias || {
          leaning: 'unknown',
          confidence: 'low',
          explanation: 'לא ניתן לקבוע הטיה פוליטית'
        },
        missingStakeholders: parsed.missingStakeholders || ['לא ניתן לנתח בעלי עניין חסרים'],
        uncoveredAngles: parsed.uncoveredAngles || ['לא ניתן לנתח זוויות לא מכוסות'],
        sourceDiversity: parsed.sourceDiversity || {
          assessment: 'לא ניתן להעריך',
          sourceTypes: ['לא ניתן לנתח סוגי מקורות'],
          balance: 'לא ניתן לקבוע איזון מקורות'
        },
        journalistQuestions: parsed.journalistQuestions || [
          'לא ניתן לנתח שאלות עיתונאיות',
          'לא ניתן לנתח שאלות עיתונאיות',
          'לא ניתן לנתח שאלות עיתונאיות'
        ],
        analysis: parsed.analysis || 'הניתוח הושלם אך הפורמט היה בלתי צפוי.',
        journalisticQuality: parsed.journalisticQuality || {
          overallScore: 5,
          titleContentMatch: {
            score: 5,
            explanation: 'לא ניתן לנתח התאמת כותרת לתוכן',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          evidenceQuality: {
            score: 5,
            explanation: 'לא ניתן לנתח איכות ראיות',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          perspectiveBalance: {
            score: 5,
            explanation: 'לא ניתן לנתח איזון נקודות מבט',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          emotionalLanguage: {
            score: 5,
            explanation: 'לא ניתן לנתח שפה רגשית',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          factualFoundation: {
            score: 5,
            explanation: 'לא ניתן לנתח בסיס עובדתי',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          storyCompleteness: {
            score: 5,
            explanation: 'לא ניתן לנתח שלמות הסיפור',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          }
        }
      })

    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', response)
      console.error('Response type:', typeof response)
      
      // Try multiple fallback strategies
      let extractedScore = 5
      let extractedAnalysis = 'הניתוח הושלם אך הפורמט היה בלתי צפוי.'
      
      // Strategy 1: Try to find any JSON-like structure
      try {
        const jsonLikeMatch = response.match(/\{[^{}]*"[^"]*"[^{}]*\}/g)
        if (jsonLikeMatch && jsonLikeMatch.length > 0) {
          console.log('Found JSON-like structure:', jsonLikeMatch[0])
          // Try to extract basic info from partial JSON
          const partialMatch = jsonLikeMatch[0].match(/"balanceScore":\s*(\d+)/)
          if (partialMatch) {
            extractedScore = parseInt(partialMatch[1])
          }
        }
      } catch (e) {
        console.log('JSON-like extraction failed:', e)
      }
      
      // Strategy 2: Try to find a score in the text
      const scoreMatch = response.match(/(\d+)\/10|score[:\s]*(\d+)|ציון[:\s]*(\d+)/i)
      if (scoreMatch) {
        extractedScore = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) || 5
      }
      
      // Strategy 3: Try to extract any Hebrew text that might be useful
      const hebrewMatch = response.match(/[\u0590-\u05FF\u200F\u200E\s]+/g)
      if (hebrewMatch && hebrewMatch.length > 0) {
        const hebrewText = hebrewMatch.join(' ').substring(0, 800)
        if (hebrewText.length > 50) { // Only use if we have substantial Hebrew text
          extractedAnalysis = hebrewText + '...'
        }
      }
      
      // Strategy 4: Try to extract English text if Hebrew fails
      if (extractedAnalysis === 'הניתוח הושלם אך הפורמט היה בלתי צפוי.') {
        const englishMatch = response.match(/[A-Za-z\s.,!?-]+/g)
        if (englishMatch && englishMatch.length > 0) {
          const englishText = englishMatch.join(' ').substring(0, 500)
          if (englishText.length > 100) {
            extractedAnalysis = 'Analysis completed but format was unexpected. Raw response: ' + englishText + '...'
          }
        }
      }
      
      console.log('Fallback analysis:', extractedAnalysis)
      console.log('Extracted score:', extractedScore)
      
      // Fallback if JSON parsing fails
      return NextResponse.json({
        balanceScore: extractedScore,
        politicalBias: {
          leaning: 'unknown',
          confidence: 'low',
          explanation: 'לא ניתן לקבוע הטיה פוליטית - שגיאה בניתוח JSON'
        },
        missingStakeholders: ['לא ניתן לנתח בעלי עניין חסרים - שגיאה בניתוח JSON'],
        uncoveredAngles: ['לא ניתן לנתח זוויות לא מכוסות - שגיאה בניתוח JSON'],
        sourceDiversity: {
          assessment: 'לא ניתן להעריך - שגיאה בניתוח JSON',
          sourceTypes: ['לא ניתן לנתח סוגי מקורות - שגיאה בניתוח JSON'],
          balance: 'לא ניתן לקבוע איזון מקורות - שגיאה בניתוח JSON'
        },
        journalistQuestions: [
          'לא ניתן לנתח שאלות עיתונאיות - שגיאה בניתוח JSON',
          'לא ניתן לנתח שאלות עיתונאיות - שגיאה בניתוח JSON',
          'לא ניתן לנתח שאלות עיתונאיות - שגיאה בניתוח JSON'
        ],
        analysis: extractedAnalysis,
        journalisticQuality: {
          overallScore: extractedScore,
          titleContentMatch: {
            score: extractedScore,
            explanation: 'לא ניתן לנתח - שגיאה בניתוח JSON',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          evidenceQuality: {
            score: extractedScore,
            explanation: 'לא ניתן לנתח - שגיאה בניתוח JSON',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          perspectiveBalance: {
            score: extractedScore,
            explanation: 'לא ניתן לנתח - שגיאה בניתוח JSON',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          emotionalLanguage: {
            score: extractedScore,
            explanation: 'לא ניתן לנתח - שגיאה בניתוח JSON',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          factualFoundation: {
            score: extractedScore,
            explanation: 'לא ניתן לנתח - שגיאה בניתוח JSON',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          },
          storyCompleteness: {
            score: extractedScore,
            explanation: 'לא ניתן לנתח - שגיאה בניתוח JSON',
            examples: ['לא ניתן לנתח'],
            suggestions: ['לא ניתן לנתח']
          }
        }
      })
    }

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ 
      error: 'נכשל בניתוח המאמר. אנא בדוק את מפתח ה-API שלך ונסה שוב.' 
    }, { status: 500 })
  }
}


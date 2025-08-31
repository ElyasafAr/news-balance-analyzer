import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Fetching article from:', url)

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'he,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    console.log('HTML content length:', html.length)

    // Extract article content using AI
    let articleContent = await extractContentWithAI(html, url)

    // If AI extraction fails, try fallback HTML parsing
    if (!articleContent || articleContent.trim().length < 100) {
      console.log('AI extraction failed, trying fallback HTML parsing...')
      articleContent = extractContentWithHTML(html, url)
    }

    // Clean and process the extracted content
    articleContent = cleanArticleContent(articleContent)

    // Limit content to maximum 12,000 characters
    const maxLength = 12000
    if (articleContent.length > maxLength) {
      articleContent = articleContent.substring(0, maxLength) + '... [המאמר קוצר בגלל אורכו]'
    }

    console.log('Final article length:', articleContent.length)

    return NextResponse.json({
      content: articleContent,
      url: url,
      contentLength: articleContent.length,
      extractionMethod: articleContent ? 'ai' : 'html-fallback'
    })

  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ 
      error: 'נכשל בקבלת המאמר מהקישור. אנא בדוק שהקישור תקין ונסה שוב.' 
    }, { status: 500 })
  }
}

// AI-powered content extraction
async function extractContentWithAI(html: string, _url: string): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Clean HTML for better AI processing
    const cleanHTML = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')

    // Limit HTML length to avoid token limits
    const maxHTMLLength = 50000
    const truncatedHTML = cleanHTML.length > maxHTMLLength 
      ? cleanHTML.substring(0, maxHTMLLength) + '... [HTML truncated]'
      : cleanHTML

    console.log('Using AI to extract content...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert web content extractor. Your job is to extract ONLY the main article content from HTML, removing all navigation, ads, social media buttons, comments, and site elements. Return ONLY the article text, preserving paragraph structure and readability. Extract the full article content - as much as available, but do not exceed 12,000 characters.`
        },
        {
          role: "user",
          content: `Extract the main article content from this HTML. Remove all navigation, ads, social media, and site elements. Return ONLY the article text with proper paragraph breaks. If this is a news article, include the headline and full story content. 

REQUIREMENTS:
- Extract the COMPLETE article content available
- Include ALL paragraphs and important details
- Do NOT exceed 12,000 characters maximum
- Preserve paragraph structure and readability
- Focus on the main story content, not sidebars or related articles

If this is not an article page, return "No article content found".

HTML:
${truncatedHTML}`
        }
      ],
      temperature: 0.1,
      max_tokens: 6000, // Increased to allow for 12,000 character output
    })

    const extractedContent = completion.choices[0]?.message?.content || ''
    
    if (extractedContent && extractedContent !== "No article content found") {
      console.log('AI extraction succeeded:', extractedContent.length, 'characters')
      return extractedContent
    } else {
      console.log('AI extraction failed or returned insufficient content')
      return ''
    }

  } catch (error) {
    console.error('AI extraction error:', error)
    return ''
  }
}

// Fallback HTML parsing (simplified version)
function extractContentWithHTML(html: string, _url: string): string {
  console.log('Using fallback HTML parsing...')
  
  // Remove script and style tags
  const content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')

  // Try to find article content
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  ]

  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches && matches[1]) {
      const extracted = extractTextFromHTML(matches[1])
      if (extracted.length > 500) {
        console.log('HTML fallback succeeded:', extracted.length, 'characters')
        return extracted
      }
    }
  }

  // Try paragraph extraction as last resort
  const paragraphMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  if (paragraphMatches && paragraphMatches.length > 0) {
    let allParagraphs = ''
    for (const p of paragraphMatches) {
      const text = extractTextFromHTML(p)
      if (text.length > 50) {
        allParagraphs += text + '\n\n'
      }
    }
    
    if (allParagraphs.length > 500) {
      console.log('Paragraph fallback succeeded:', allParagraphs.length, 'characters')
      return allParagraphs
    }
  }

  console.log('HTML fallback failed')
  return ''
}

// Extract clean text from HTML
function extractTextFromHTML(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  text = text
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()

  return text
}

// Clean article content
function cleanArticleContent(content: string) {
  if (!content) return ''

  let cleaned = content
    // Remove common unwanted patterns
    .replace(/תגיות[\s\S]*?The Butterfly Button.*?$/gm, '')
    .replace(/הדפסהמצאתם טעות\? דווחו לנו.*?$/gm, '')
    .replace(/עקבו אחרינו[\s\S]*?$/gm, '')
    .replace(/אתרים נוספים[\s\S]*?$/gm, '')
    .replace(/ערוצים נוספים[\s\S]*?$/gm, '')
    .replace(/יצירת קשר[\s\S]*?$/gm, '')
    .replace(/מנויים[\s\S]*?$/gm, '')
    .replace(/ערוצי ynet[\s\S]*?$/gm, '')
    .replace(/דף הבית[\s\S]*?התנתקות/g, '')
    .replace(/ראשי[\s\S]*?עוד/g, '')
    .replace(/\+ynet[\s\S]*?ידיעות מנויים/g, '')

  cleaned = cleaned.replace(/\n{5,}/g, '\n\n\n\n')
  cleaned = cleaned.trim()

  return cleaned
}


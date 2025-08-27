import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting news processing...')
    
    // 1. Scrape Rotter.net for events
    const rotterEvents = await scrapeRotterNet()
    console.log(`Found ${rotterEvents.length} events from Rotter.net`)
    
    // 2. Process each event
    for (const event of rotterEvents) {
      await processEvent(event)
    }
    
    console.log('News processing completed')
    
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${rotterEvents.length} events`,
      processedEvents: rotterEvents.length
    })

  } catch (error) {
    console.error('Error processing news events:', error)
    return NextResponse.json({ 
      error: 'שגיאה בעיבוד אירועי חדשות' 
    }, { status: 500 })
  }
}

// Scrape Rotter.net for events
async function scrapeRotterNet() {
  try {
    const response = await fetch('https://rotter.net/forum/listforum.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'he,en-US;q=0.7,en;q=0.3',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract events from the last 24 hours
    const events = extractRotterEvents(html)
    
    return events
  } catch (error) {
    console.error('Error scraping Rotter.net:', error)
    return []
  }
}

// Extract events from Rotter.net HTML
function extractRotterEvents(html: string) {
  const events = []
  
  try {
    // Look for event patterns in the HTML
    // This is a simplified extraction - you'll need to adjust based on actual HTML structure
    const eventMatches = html.match(/<tr[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)
    
    if (eventMatches) {
      for (const match of eventMatches) {
        const titleMatch = match.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/i)
        const dateMatch = match.match(/<td[^>]*>(\d{1,2}\/\d{1,2}\/\d{4})<\/td>/i)
        
        if (titleMatch && dateMatch) {
          const url = titleMatch[1]
          const title = titleMatch[2].trim()
          const dateStr = dateMatch[1]
          
          // Parse date and check if it's from last 24 hours
          const eventDate = parseRotterDate(dateStr)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          
          if (eventDate >= yesterday) {
            events.push({
              title,
              url: `https://rotter.net${url}`,
              publishedAt: eventDate,
              source: 'rotter.net'
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('Error extracting events:', error)
  }
  
  return events
}

// Parse Rotter.net date format
function parseRotterDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Process a single event
async function processEvent(event: any) {
  try {
    // Check if event already exists
    const existingEvent = await prisma.newsEvent.findFirst({
      where: {
        title: event.title,
        source: event.source
      }
    })

    if (existingEvent) {
      console.log(`Event already exists: ${event.title}`)
      return
    }

    // Create the event
    const createdEvent = await prisma.newsEvent.create({
      data: {
        title: event.title,
        url: event.url,
        source: event.source,
        publishedAt: event.publishedAt
      }
    })

    console.log(`Created event: ${event.title}`)

    // 2. Scrape multiple news sources for this event
    const newsArticles = await scrapeNewsSources(event.title)
    
    // Save articles to database
    for (const article of newsArticles) {
      await prisma.newsArticle.create({
        data: {
          title: article.title,
          content: article.content,
          url: article.url,
          source: article.source,
          eventId: createdEvent.id
        }
      })
    }

    // 3. Generate balanced summary using AI
    if (newsArticles.length > 0) {
      const summary = await generateBalancedSummary(event.title, newsArticles)
      
      if (summary) {
        await prisma.balancedSummary.create({
          data: {
            summary: summary.summary,
            viewpoints: summary.viewpoints,
            biasScore: summary.biasScore,
            confidence: summary.confidence,
            eventId: createdEvent.id
          }
        })
      }
    }

  } catch (error) {
    console.error(`Error processing event ${event.title}:`, error)
  }
}

// Scrape multiple Israeli news sources
async function scrapeNewsSources(eventTitle: string) {
  const sources = [
    'ynet.co.il',
    'haaretz.co.il', 
    'maariv.co.il',
    'walla.co.il',
    'n12.co.il'
  ]
  
  const articles = []
  
  for (const source of sources) {
    try {
      const article = await searchNewsSource(source, eventTitle)
      if (article) {
        articles.push(article)
      }
    } catch (error) {
      console.error(`Error scraping ${source}:`, error)
    }
  }
  
  return articles
}

// Search a specific news source for articles about the event
async function searchNewsSource(source: string, eventTitle: string) {
  try {
    // This is a simplified search - you'll need to implement proper search for each source
    const searchUrl = getSearchUrl(source, eventTitle)
    
    if (!searchUrl) return null
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    
    // Extract article content (simplified)
    const article = extractArticleContent(html, source)
    
    return article
  } catch (error) {
    console.error(`Error searching ${source}:`, error)
    return null
  }
}

// Get search URL for different news sources
function getSearchUrl(source: string, query: string): string | null {
  const encodedQuery = encodeURIComponent(query)
  
  switch (source) {
    case 'ynet.co.il':
      return `https://www.ynet.co.il/search?q=${encodedQuery}`
    case 'haaretz.co.il':
      return `https://www.haaretz.co.il/search?q=${encodedQuery}`
    case 'maariv.co.il':
      return `https://www.maariv.co.il/search?q=${encodedQuery}`
    case 'walla.co.il':
      return `https://news.walla.co.il/search?q=${encodedQuery}`
    case 'n12.co.il':
      return `https://www.mako.co.il/search?q=${encodedQuery}`
    default:
      return null
  }
}

// Extract article content from HTML
function extractArticleContent(html: string, source: string) {
  // Simplified extraction - you'll need to implement proper extraction for each source
  const contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                      html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  
  if (contentMatch) {
    const content = contentMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000) // Limit content length
    
    return {
      title: 'Article Title', // You'll need to extract actual title
      content,
      url: 'https://example.com', // You'll need to extract actual URL
      source
    }
  }
  
  return null
}

// Generate balanced summary using AI
async function generateBalancedSummary(eventTitle: string, articles: any[]) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Prepare content for AI analysis
    const articlesText = articles.map(article => 
      `Source: ${article.source}\nTitle: ${article.title}\nContent: ${article.content.substring(0, 500)}...`
    ).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert news analyst. Your job is to create a balanced summary of a news event based on multiple sources, representing different viewpoints fairly.`
        },
        {
          role: "user",
          content: `Create a balanced summary for this news event: "${eventTitle}"

Sources:
${articlesText}

Please provide:
1. A balanced summary (200-300 words)
2. Different viewpoints represented
3. Bias score (-10 to +10, where -10 is very left-leaning, +10 is very right-leaning, 0 is neutral)
4. Confidence level (0-1, where 1 is very confident)

Return as JSON:
{
  "summary": "balanced summary text",
  "viewpoints": "different viewpoints represented",
  "biasScore": 0.0,
  "confidence": 0.8
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || ''
    
    try {
      const summary = JSON.parse(response)
      return summary
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return null
    }

  } catch (error) {
    console.error('Error generating summary:', error)
    return null
  }
}

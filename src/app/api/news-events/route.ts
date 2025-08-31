import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get events from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const events = await prisma.newsEvent.findMany({
      where: {
        publishedAt: {
          gte: yesterday
        }
      },
      include: {
        newsArticles: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        summary: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 50 // Limit to 50 most recent events
    })

    // Get last update time
    const lastUpdate = await prisma.newsEvent.findFirst({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        updatedAt: true
      }
    })

    return NextResponse.json({
      events,
      lastUpdate: lastUpdate?.updatedAt || null
    })

  } catch (error) {
    console.error('Error fetching news events:', error)
    return NextResponse.json({ 
      error: 'שגיאה בטעינת אירועי חדשות' 
    }, { status: 500 })
  }
}

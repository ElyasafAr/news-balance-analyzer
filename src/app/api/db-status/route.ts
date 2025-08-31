import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await prisma.$connect();
    
    // Get database statistics
    const newsItemsCount = await prisma.newsItem.count();
    const newsHashesCount = await prisma.newsHash.count();
    
    // Get recent articles
    const recentArticles = await prisma.newsItem.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        url: true,
        created_at: true,
        isProcessed: true,
        content_length: true
      }
    });
    
    // Get processing status
    const unprocessedCount = await prisma.newsItem.count({
      where: { isProcessed: 0 }
    });
    
    const processedRelevantCount = await prisma.newsItem.count({
      where: { isProcessed: 1 }
    });
    
    const processedNonRelevantCount = await prisma.newsItem.count({
      where: { isProcessed: 2 }
    });
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connection: 'Connected',
        tables: {
          newsItems: newsItemsCount,
          newsHashes: newsHashesCount
        },
        processing: {
          total: newsItemsCount,
          unprocessed: unprocessedCount,
          processedRelevant: processedRelevantCount,
          processedNonRelevant: processedNonRelevantCount
        }
      },
      recentArticles: recentArticles
    });
    
  } catch (error) {
    console.error('Database status error:', error);
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connection: 'Failed',
        tables: {},
        processing: {}
      }
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

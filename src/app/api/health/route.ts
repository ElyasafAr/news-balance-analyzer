import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    railway: process.env.RAILWAY_LOG_LEVEL
  });
}

export async function POST() {
  try {
    // Only import prisma during runtime, not build time
    const { prisma } = await import('@/lib/db');
    
    // Initialize database tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS news_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        scraped_at TEXT NOT NULL,
        row_text TEXT,
        actual_datetime TEXT NOT NULL,
        content TEXT,
        clean_content TEXT,
        content_length INTEGER,
        date_time TEXT,
        hash_id TEXT UNIQUE,
        isProcessed BOOLEAN DEFAULT 0,
        process_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS news_hashes (
        hash_id TEXT PRIMARY KEY,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Database tables initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

const { PrismaClient } = require('@prisma/client');

async function checkOrdering() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת סידור הכתבות ===');
    
    // Get articles with different ordering options
    const byActualDatetime = await prisma.newsItem.findMany({
      where: { isprocessed: 1 },
      orderBy: { actual_datetime: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        actual_datetime: true,
        created_at: true
      }
    });
    
    console.log('\nסידור לפי actual_datetime (desc):');
    byActualDatetime.forEach((article, index) => {
      console.log(`${index + 1}. ID: ${article.id} | ${article.actual_datetime} | ${article.title.substring(0, 50)}...`);
    });
    
    const byCreatedAt = await prisma.newsItem.findMany({
      where: { isprocessed: 1 },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        actual_datetime: true,
        created_at: true
      }
    });
    
    console.log('\nסידור לפי created_at (desc):');
    byCreatedAt.forEach((article, index) => {
      console.log(`${index + 1}. ID: ${article.id} | ${article.created_at} | ${article.title.substring(0, 50)}...`);
    });
    
    // Check if actual_datetime is a valid date
    console.log('\nבדיקת פורמט actual_datetime:');
    const sampleArticle = await prisma.newsItem.findFirst({
      where: { isprocessed: 1 },
      select: { actual_datetime: true }
    });
    
    if (sampleArticle) {
      console.log(`דוגמה ל-actual_datetime: "${sampleArticle.actual_datetime}"`);
      const date = new Date(sampleArticle.actual_datetime);
      console.log(`האם זה תאריך תקין: ${!isNaN(date.getTime())}`);
      console.log(`תאריך מפורש: ${date.toISOString()}`);
    }
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrdering();

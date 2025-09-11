const { PrismaClient } = require('@prisma/client');

async function checkLatestArticles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת השורות האחרונות בטבלה ===');
    
    // Get the latest 10 articles by created_at
    const latestArticles = await prisma.newsItem.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        actual_datetime: true,
        created_at: true,
        isprocessed: true
      }
    });
    
    console.log('\n10 השורות האחרונות (לפי created_at):');
    latestArticles.forEach((article, index) => {
      console.log(`\n${index + 1}. ID: ${article.id}`);
      console.log(`   כותרת: ${article.title.substring(0, 60)}...`);
      console.log(`   actual_datetime: "${article.actual_datetime}"`);
      console.log(`   created_at: ${article.created_at}`);
      console.log(`   מעובד: ${article.isprocessed}`);
      
      // Check if actual_datetime is a valid date
      const date = new Date(article.actual_datetime);
      if (!isNaN(date.getTime())) {
        console.log(`   תאריך מפורש: ${date.toISOString()}`);
        console.log(`   שעה ישראלית: ${date.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}`);
      } else {
        console.log(`   ❌ תאריך לא תקין!`);
      }
    });
    
    // Check if there are any new processed articles
    const processedCount = await prisma.newsItem.count({
      where: { isprocessed: 1 }
    });
    
    console.log(`\nסה"כ רשומות מעובדות: ${processedCount}`);
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestArticles();

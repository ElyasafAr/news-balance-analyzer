const { PrismaClient } = require('@prisma/client');

async function checkArticles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת כתבות במסד הנתונים ===');
    
    // Check a few articles to see their structure
    const articles = await prisma.newsItem.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        isProcessed: true,
        process_data: true,
        clean_content: true,
        created_at: true
      }
    });
    
    articles.forEach((article, index) => {
      console.log(`\n--- כתבה ${index + 1} ---`);
      console.log(`ID: ${article.id}`);
      console.log(`כותרת: ${article.title}`);
      console.log(`מעובד: ${article.isProcessed}`);
      console.log(`יש process_data: ${article.process_data ? 'כן' : 'לא'}`);
      console.log(`יש clean_content: ${article.clean_content ? 'כן' : 'לא'}`);
      if (article.process_data) {
        console.log(`אורך process_data: ${article.process_data.length} תווים`);
        console.log(`תחילת process_data: ${article.process_data.substring(0, 100)}...`);
      }
    });
    
    // Check if any articles have process_data but isProcessed = 0
    const articlesWithProcessData = await prisma.newsItem.count({
      where: {
        process_data: { not: null },
        isProcessed: 0
      }
    });
    
    console.log(`\nרשומות עם process_data אבל isProcessed = 0: ${articlesWithProcessData}`);
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles();



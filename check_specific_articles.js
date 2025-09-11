const { PrismaClient } = require('@prisma/client');

async function checkSpecificArticles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת כתבות ID 127 ו-128 ===');
    
    // Get specific articles
    const articles = await prisma.newsItem.findMany({
      where: {
        id: { in: [127, 128] }
      },
      select: {
        id: true,
        title: true,
        url: true,
        actual_datetime: true,
        created_at: true,
        isprocessed: true,
        process_data: true,
        clean_content: true
      }
    });
    
    articles.forEach((article, index) => {
      console.log(`\n=== כתבה ${article.id} ===`);
      console.log(`כותרת: ${article.title}`);
      console.log(`URL: ${article.url}`);
      console.log(`actual_datetime: ${article.actual_datetime}`);
      console.log(`created_at: ${article.created_at}`);
      console.log(`מעובד: ${article.isprocessed}`);
      console.log(`יש process_data: ${article.process_data ? 'כן' : 'לא'}`);
      console.log(`יש clean_content: ${article.clean_content ? 'כן' : 'לא'}`);
      
      if (article.process_data) {
        console.log(`אורך process_data: ${article.process_data.length} תווים`);
        console.log(`תחילת process_data: ${article.process_data.substring(0, 200)}...`);
        
        // Try to parse process_data
        try {
          const processData = JSON.parse(article.process_data);
          console.log(`process_data מפורש בהצלחה עם מפתחות: ${Object.keys(processData).join(', ')}`);
        } catch (e) {
          console.log(`❌ שגיאה בפרסור process_data: ${e.message}`);
        }
      }
      
      if (article.clean_content) {
        console.log(`אורך clean_content: ${article.clean_content.length} תווים`);
        console.log(`תחילת clean_content: ${article.clean_content.substring(0, 200)}...`);
      }
    });
    
    // Check if they appear in the API
    console.log('\n=== בדיקת API ===');
    const apiArticles = await prisma.newsItem.findMany({
      where: {
        isprocessed: 1
      },
      orderBy: {
        actual_datetime: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        isprocessed: true
      }
    });
    
    console.log('5 הכתבות הראשונות ב-API:');
    apiArticles.forEach((article, index) => {
      console.log(`${index + 1}. ID: ${article.id} | מעובד: ${article.isprocessed} | ${article.title.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificArticles();


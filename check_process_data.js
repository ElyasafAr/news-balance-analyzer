const { PrismaClient } = require('@prisma/client');

async function checkProcessData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת process_data ===');
    
    // Count articles with process_data
    const withProcessData = await prisma.newsItem.count({
      where: {
        process_data: { not: null }
      }
    });
    
    const withoutProcessData = await prisma.newsItem.count({
      where: {
        process_data: null
      }
    });
    
    console.log(`רשומות עם process_data: ${withProcessData}`);
    console.log(`רשומות ללא process_data: ${withoutProcessData}`);
    
    // Show articles with process_data
    if (withProcessData > 0) {
      console.log('\nרשומות עם process_data:');
      const articlesWithData = await prisma.newsItem.findMany({
        where: {
          process_data: { not: null }
        },
        take: 3,
        select: {
          id: true,
          title: true,
          isProcessed: true,
          process_data: true,
          created_at: true
        }
      });
      
      articlesWithData.forEach((article, index) => {
        console.log(`\n--- כתבה ${index + 1} ---`);
        console.log(`ID: ${article.id}`);
        console.log(`כותרת: ${article.title}`);
        console.log(`isProcessed: ${article.isProcessed}`);
        console.log(`אורך process_data: ${article.process_data.length} תווים`);
        console.log(`תחילת process_data: ${article.process_data.substring(0, 200)}...`);
      });
    }
    
    // Check if we should update some articles to isProcessed = 1
    if (withProcessData > 0) {
      console.log(`\n💡 יש ${withProcessData} רשומות עם process_data - אפשר לעדכן אותן ל-isProcessed = 1`);
    }
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProcessData();



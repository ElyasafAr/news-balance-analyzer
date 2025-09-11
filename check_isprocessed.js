const { PrismaClient } = require('@prisma/client');

async function checkIsProcessed() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת שדה isProcessed ===');
    
    // Check different values of isProcessed
    const processed1 = await prisma.newsItem.count({
      where: { isProcessed: 1 }
    });
    
    const processed0 = await prisma.newsItem.count({
      where: { isProcessed: 0 }
    });
    
    console.log(`רשומות עם isProcessed = 1: ${processed1}`);
    console.log(`רשומות עם isProcessed = 0: ${processed0}`);
    
    // Check if there are any other values
    const allValues = await prisma.newsItem.findMany({
      select: { isProcessed: true },
      distinct: ['isProcessed']
    });
    
    console.log('\nכל הערכים הקיימים של isProcessed:');
    allValues.forEach(item => {
      console.log(`- ${item.isProcessed}`);
    });
    
    // Check articles with isProcessed = 1
    if (processed1 > 0) {
      console.log('\nרשומות עם isProcessed = 1:');
      const processedArticles = await prisma.newsItem.findMany({
        where: { isProcessed: 1 },
        take: 3,
        select: {
          id: true,
          title: true,
          isProcessed: true,
          process_data: true,
          created_at: true
        }
      });
      
      processedArticles.forEach((article, index) => {
        console.log(`\n--- כתבה מעובדת ${index + 1} ---`);
        console.log(`ID: ${article.id}`);
        console.log(`כותרת: ${article.title}`);
        console.log(`isProcessed: ${article.isProcessed}`);
        console.log(`יש process_data: ${article.process_data ? 'כן' : 'לא'}`);
        if (article.process_data) {
          console.log(`אורך process_data: ${article.process_data.length} תווים`);
        }
      });
    }
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIsProcessed();



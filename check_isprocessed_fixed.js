const { PrismaClient } = require('@prisma/client');

async function checkIsProcessedFixed() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת isprocessed (תוקן) ===');
    
    // Check different values of isprocessed
    const processed1 = await prisma.newsItem.count({
      where: { isprocessed: 1 }
    });
    
    const processed0 = await prisma.newsItem.count({
      where: { isprocessed: 0 }
    });
    
    console.log(`רשומות עם isprocessed = 1: ${processed1}`);
    console.log(`רשומות עם isprocessed = 0: ${processed0}`);
    
    // Check if there are any other values
    const allValues = await prisma.newsItem.findMany({
      select: { isprocessed: true },
      distinct: ['isprocessed']
    });
    
    console.log('\nכל הערכים הקיימים של isprocessed:');
    allValues.forEach(item => {
      console.log(`- ${item.isprocessed}`);
    });
    
    // Check articles with isprocessed = 1
    if (processed1 > 0) {
      console.log('\nרשומות עם isprocessed = 1:');
      const processedArticles = await prisma.newsItem.findMany({
        where: { isprocessed: 1 },
        take: 3,
        select: {
          id: true,
          title: true,
          isprocessed: true,
          process_data: true,
          created_at: true
        }
      });
      
      processedArticles.forEach((article, index) => {
        console.log(`\n--- כתבה מעובדת ${index + 1} ---`);
        console.log(`ID: ${article.id}`);
        console.log(`כותרת: ${article.title}`);
        console.log(`isprocessed: ${article.isprocessed}`);
        console.log(`יש process_data: ${article.process_data ? 'כן' : 'לא'}`);
        if (article.process_data) {
          console.log(`אורך process_data: ${article.process_data.length} תווים`);
        }
      });
    } else {
      console.log('\n⚠️  אין רשומות עם isprocessed = 1');
      console.log('💡 צריך לעדכן חלק מהרשומות ל-isprocessed = 1');
    }
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIsProcessedFixed();

const { PrismaClient } = require('@prisma/client');

async function debugProcessData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת process_data של כתבות 127 ו-128 ===');
    
    const articles = await prisma.newsItem.findMany({
      where: { id: { in: [127, 128] } },
      select: { id: true, title: true, process_data: true }
    });
    
    articles.forEach(article => {
      console.log(`\n=== כתבה ${article.id} ===`);
      console.log(`כותרת: ${article.title}`);
      
      if (article.process_data) {
        try {
          const processData = JSON.parse(article.process_data);
          console.log('מפתחות ב-process_data:', Object.keys(processData));
          
          if (processData.analysis) {
            console.log('מפתחות ב-analysis:', Object.keys(processData.analysis));
          }
          
          // Show the full structure
          console.log('מבנה מלא:');
          console.log(JSON.stringify(processData, null, 2));
          
        } catch (e) {
          console.log('שגיאה בפרסור JSON:', e.message);
          console.log('תחילת process_data:', article.process_data.substring(0, 500));
        }
      }
    });
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProcessData();


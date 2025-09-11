const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת מסד הנתונים ===');
    
    // Check tables
    console.log('\n1. בדיקת טבלאות:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('טבלאות קיימות:', tables);
    
    // Count news_items
    console.log('\n2. ספירת רשומות בטבלת news_items:');
    const totalCount = await prisma.newsItem.count();
    console.log(`סה"כ רשומות: ${totalCount}`);
    
    // Count processed items
    const processedCount = await prisma.newsItem.count({
      where: { isProcessed: 1 }
    });
    console.log(`רשומות מעובדות: ${processedCount}`);
    
    // Show recent items
    console.log('\n3. רשומות אחרונות:');
    const recentItems = await prisma.newsItem.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        isProcessed: true,
        created_at: true
      }
    });
    console.log('רשומות אחרונות:', recentItems);
    
    // Check if there are any items at all
    if (totalCount === 0) {
      console.log('\n⚠️  המסד נתונים ריק - אין רשומות בטבלת news_items');
    } else {
      console.log('\n✅ יש נתונים במסד הנתונים');
    }
    
  } catch (error) {
    console.error('שגיאה בבדיקת מסד הנתונים:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();



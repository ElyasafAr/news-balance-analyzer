const { PrismaClient } = require('@prisma/client');

async function checkRealField() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת השדה האמיתי במסד הנתונים ===');
    
    // Try to get the actual column names from the database
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'news_items' 
      AND column_name LIKE '%process%'
      ORDER BY ordinal_position
    `;
    
    console.log('עמודות הקשורות ל-process:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Try both field names
    console.log('\nבדיקת isProcessed (עם P גדולה):');
    try {
      const count1 = await prisma.newsItem.count({
        where: { isProcessed: 1 }
      });
      console.log(`רשומות עם isProcessed = 1: ${count1}`);
    } catch (e) {
      console.log('שגיאה עם isProcessed:', e.message);
    }
    
    // Check what values actually exist
    console.log('\nבדיקת ערכים קיימים:');
    const sample = await prisma.newsItem.findFirst({
      select: {
        id: true,
        title: true,
        isProcessed: true
      }
    });
    
    if (sample) {
      console.log('דוגמה לרשומה:');
      console.log(`ID: ${sample.id}`);
      console.log(`כותרת: ${sample.title}`);
      console.log(`isProcessed: ${sample.isProcessed}`);
    }
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealField();



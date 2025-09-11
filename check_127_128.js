const { PrismaClient } = require('@prisma/client');

async function check127_128() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== בדיקת כתבות 127 ו-128 ===');
    
    const article127 = await prisma.newsItem.findUnique({
      where: { id: 127 },
      select: {
        id: true,
        title: true,
        isprocessed: true,
        process_data: true,
        clean_content: true
      }
    });
    
    const article128 = await prisma.newsItem.findUnique({
      where: { id: 128 },
      select: {
        id: true,
        title: true,
        isprocessed: true,
        process_data: true,
        clean_content: true
      }
    });
    
    console.log('\nכתבה 127:');
    if (article127) {
      console.log(`כותרת: ${article127.title}`);
      console.log(`מעובד: ${article127.isprocessed}`);
      console.log(`יש process_data: ${article127.process_data ? 'כן' : 'לא'}`);
      console.log(`יש clean_content: ${article127.clean_content ? 'כן' : 'לא'}`);
    } else {
      console.log('לא נמצאה');
    }
    
    console.log('\nכתבה 128:');
    if (article128) {
      console.log(`כותרת: ${article128.title}`);
      console.log(`מעובד: ${article128.isprocessed}`);
      console.log(`יש process_data: ${article128.process_data ? 'כן' : 'לא'}`);
      console.log(`יש clean_content: ${article128.clean_content ? 'כן' : 'לא'}`);
    } else {
      console.log('לא נמצאה');
    }
    
  } catch (error) {
    console.error('שגיאה:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check127_128();


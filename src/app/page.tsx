'use client'

import NewsFeed from '@/components/NewsFeed'
import SideMenu from '@/components/SideMenu'

export default function Home() {
  console.log('=== HOME PAGE LOADING ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Port:', process.env.PORT);
  console.log('Timestamp:', new Date().toISOString());

  return (
    <>
      <SideMenu />
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          חדשות מאוזנות
        </h1>
        <p className="text-lg text-gray-600">
          הצגת חדשות בצורה מאוזנת על ידי שימוש בכלי AI
        </p>
      </div>

      {/* Content - Only News Feed */}
      <NewsFeed />
      </div>
    </>
  )
}


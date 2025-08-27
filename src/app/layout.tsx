import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'News Balance Analyzer & Aggregator',
  description: 'Analyze news bias and get balanced summaries from multiple Israeli news sources',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  )
}


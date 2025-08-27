# 🚀 Quick Setup Guide - News Aggregator

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create `.env.local` in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=any_random_string_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Setup Database
```bash
npm run db:generate
npm run db:push
```

### 4. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 What You Get

✅ **Two Tools in One App:**
- **News Analyzer**: Analyze individual articles for bias
- **News Aggregator**: Get balanced summaries from multiple sources

✅ **Smart Content Extraction:**
- AI-powered article extraction from URLs
- Works with any Hebrew news site
- No more copy-pasting articles

✅ **Balanced News Feed:**
- Events from Rotter.net (last 24 hours)
- Articles from major Israeli news sources
- AI-generated balanced summaries
- Bias scoring and confidence levels

## 🔄 How to Use

### News Analyzer (Original Tool)
1. Switch to "ניתוח מאמרים" tab
2. Paste any news article URL
3. Get instant bias analysis

### News Aggregator (New Tool)
1. Switch to "אגרגטור חדשות" tab
2. Click "התחל עיבוד חדשות"
3. View balanced news feed

## 🚨 Troubleshooting

**Database Error?**
```bash
npm run db:generate
npm run db:push
```

**OpenAI Error?**
- Check your API key in `.env.local`
- Ensure you have credits in your OpenAI account

**Content Extraction Issues?**
- Check browser console for errors
- Verify the URL is accessible

## 🎉 You're Ready!

The app now has both tools:
- **Left Tab**: News Analyzer (analyze individual articles)
- **Right Tab**: News Aggregator (get balanced summaries)

Start with the News Aggregator to see the magic happen! 🚀

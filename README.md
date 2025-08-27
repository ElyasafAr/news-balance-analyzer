# News Balance Analyzer & Aggregator

A comprehensive tool for analyzing news bias and generating balanced summaries from multiple Israeli news sources.

## 🚀 Features

### 1. News Analyzer
- **URL Input**: Paste article URLs for automatic content extraction
- **AI-Powered Analysis**: Uses GPT-4o-mini for comprehensive bias analysis
- **Journalistic Quality Assessment**: 6-parameter scoring system
- **RTL Support**: Full Hebrew language support

### 2. News Aggregator (NEW!)
- **Rotter.net Integration**: Scrapes events from the last 24 hours
- **Multi-Source Crawling**: Collects articles from major Israeli news sites
- **AI-Generated Summaries**: Creates balanced summaries representing all viewpoints
- **Background Processing**: Runs automatically and saves results to database
- **News Feed Display**: Shows events with balanced analysis

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Database URL (SQLite for development)
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio for database management
npm run db:studio
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### NewsEvent
- **id**: Unique identifier
- **title**: Event title
- **description**: Event description
- **source**: Source (e.g., "rotter.net")
- **url**: Source URL
- **publishedAt**: Publication date
- **createdAt/updatedAt**: Timestamps

### NewsArticle
- **id**: Unique identifier
- **title**: Article title
- **content**: Article content
- **url**: Article URL
- **source**: News source (e.g., "ynet.co.il")
- **eventId**: Reference to NewsEvent

### BalancedSummary
- **id**: Unique identifier
- **summary**: AI-generated balanced summary
- **viewpoints**: Different viewpoints represented
- **biasScore**: Bias score (-10 to +10)
- **confidence**: Confidence level (0-1)
- **eventId**: Reference to NewsEvent

## 🔄 How It Works

### News Aggregator Process
1. **Event Discovery**: Scrapes Rotter.net for events from last 24 hours
2. **Multi-Source Crawling**: Searches major Israeli news sites for each event
3. **Content Extraction**: Uses AI to extract clean article content
4. **Balanced Analysis**: AI generates summaries representing all viewpoints
5. **Database Storage**: Saves events, articles, and summaries
6. **Feed Display**: Shows balanced news feed to users

### Supported News Sources
- **Rotter.net** (event discovery)
- **Ynet.co.il** (article collection)
- **Haaretz.co.il** (article collection)
- **Maariv.co.il** (article collection)
- **Walla.co.il** (article collection)
- **N12.co.il** (article collection)

## 🎯 Usage

### Switching Between Tools
Use the navigation tabs at the top:
- **ניתוח מאמרים** (Article Analysis): Original news analyzer
- **אגרגטור חדשות** (News Aggregator): New aggregation tool

### Starting News Processing
1. Navigate to the News Aggregator tab
2. Click "התחל עיבוד חדשות" (Start News Processing)
3. Wait for processing to complete
4. View the balanced news feed

### Manual Refresh
Click "רענן" (Refresh) to manually update the feed.

## 🔧 Technical Details

### AI Models Used
- **GPT-4o-mini**: Primary model for content extraction and analysis
- **GPT-3.5-turbo**: Fallback model for JSON parsing issues

### Content Length Limits
- **No minimum length**: Articles are extracted as-is
- **Maximum length**: 12,000 characters (truncated if longer)

### Background Processing
- Runs on-demand via API endpoint
- Processes events sequentially
- Saves results to SQLite database
- Handles errors gracefully

## 🚨 Important Notes

### Rate Limiting
- Respects website rate limits
- Implements delays between requests
- Uses proper User-Agent headers

### Content Extraction
- AI-powered extraction for reliability
- Fallback HTML parsing if AI fails
- Content cleaning and normalization

### Database Management
- SQLite for development (easy setup)
- Can be migrated to PostgreSQL/MySQL for production
- Automatic indexing for performance

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure `.env.local` has correct DATABASE_URL
2. **OpenAI API**: Verify OPENAI_API_KEY is valid
3. **Content Extraction**: Check console logs for extraction errors
4. **Rate Limiting**: Some news sites may block rapid requests

### Debug Mode
Check browser console and server logs for detailed error information.

## 🔮 Future Enhancements

- **Scheduled Processing**: Cron jobs for automatic updates
- **More News Sources**: Additional Israeli and international sources
- **Advanced Analytics**: Bias trends and source comparison
- **User Preferences**: Customizable news feed
- **Export Features**: PDF reports and data export

## 📄 License

This project is for educational and research purposes. Please respect the terms of service of all news sources used.

## 🤝 Contributing

Contributions are welcome! Please ensure proper error handling and respect for rate limits when scraping external sources.

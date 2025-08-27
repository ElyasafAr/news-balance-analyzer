import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Open SQLite database directly
    const dbPath = path.join(process.cwd(), 'rotter_news.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Get all processed articles (isProcessed = 1) ordered by publication date (newest first)
    const allArticles = await db.all(`
      SELECT 
        id,
        title,
        url,
        clean_content,
        actual_datetime,
        process_data,
        created_at
      FROM news_items 
      WHERE isProcessed = 1 
      ORDER BY actual_datetime DESC
    `);

    console.log(`Found ${allArticles.length} articles with isProcessed = 1`);
    
    // Log the first article's process_data length to check for truncation
    if (allArticles.length > 0) {
      const firstArticle = allArticles[0];
      console.log(`First article ID: ${firstArticle.id}`);
      console.log(`First article process_data length: ${firstArticle.process_data ? firstArticle.process_data.length : 0}`);
      console.log(`First article process_data preview: ${firstArticle.process_data ? firstArticle.process_data.substring(0, 200) + '...' : 'null'}`);
    }

    await db.close();

    // Filter relevant articles on the client side
    const relevantArticles = allArticles.filter(article => {
      if (!article.process_data) {
        console.log(`Article ${article.id} has no process_data`);
        return false;
      }
      
      // Simple check - if the JSON contains "relevant": true or "is_relevant": true, consider it relevant
      if (article.process_data.includes('"relevant": true') || article.process_data.includes('"is_relevant": true')) {
        console.log(`Article ${article.id} contains relevant or is_relevant = true`);
        return true;
      }
      
      try {
        // Clean up the JSON string by removing extra escape characters and newlines
        let cleanJson = article.process_data;
        
        // Remove extra backslashes and quotes
        cleanJson = cleanJson.replace(/\\"/g, '"');
        cleanJson = cleanJson.replace(/\\\\/g, '\\');
        
        // Remove newlines that might break JSON parsing
        cleanJson = cleanJson.replace(/\n/g, ' ');
        cleanJson = cleanJson.replace(/\r/g, ' ');
        
        console.log(`Article ${article.id} - Cleaned JSON:`, cleanJson.substring(0, 200) + '...');
        
        const processData = JSON.parse(cleanJson);
        console.log(`Article ${article.id} - Parsed JSON keys:`, Object.keys(processData));
        
        // Check if it's the new format with relevant field
        if (processData.relevant !== undefined) {
          console.log(`Article ${article.id} has relevant = ${processData.relevant}`);
          return processData.relevant === true;
        }
        // Check if it's the old format with is_relevant field
        if (processData.is_relevant !== undefined) {
          console.log(`Article ${article.id} has is_relevant = ${processData.is_relevant}`);
          return processData.is_relevant === true;
        }
        // Check if the analysis field is a string that contains JSON
        if (processData.analysis && typeof processData.analysis === 'string') {
          try {
            // Clean up the nested JSON as well
            let cleanNestedJson = processData.analysis;
            cleanNestedJson = cleanNestedJson.replace(/\n/g, ' ');
            cleanNestedJson = cleanNestedJson.replace(/\r/g, ' ');
            
            console.log(`Article ${article.id} - Nested JSON:`, cleanNestedJson.substring(0, 200) + '...');
            
            const parsedAnalysis = JSON.parse(cleanNestedJson);
            console.log(`Article ${article.id} - Parsed nested JSON keys:`, Object.keys(parsedAnalysis));
            
            if (parsedAnalysis.relevant !== undefined) {
              console.log(`Article ${article.id} has relevant = ${parsedAnalysis.relevant} in nested analysis`);
              return parsedAnalysis.relevant === true;
            }
            if (parsedAnalysis.is_relevant !== undefined) {
              console.log(`Article ${article.id} has is_relevant = ${parsedAnalysis.is_relevant} in nested analysis`);
              return parsedAnalysis.is_relevant === true;
            }
          } catch (e) {
            console.log(`Article ${article.id} failed to parse nested analysis:`, e);
          }
        }
        // If no relevance field found, consider it relevant
        console.log(`Article ${article.id} has no relevance field, considering relevant`);
        return true;
      } catch (error) {
        console.log(`Article ${article.id} failed to parse JSON:`, error);
        return false;
      }
    });

    console.log(`Found ${relevantArticles.length} relevant articles after filtering`);

    // Apply pagination
    const totalCount = relevantArticles.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const articles = relevantArticles.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      articles: articles,
      count: articles.length,
      totalCount: totalCount,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching news feed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news feed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

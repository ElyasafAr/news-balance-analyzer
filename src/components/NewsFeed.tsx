'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface NewsArticle {
  id: number;
  title: string;
  url: string;
  clean_content: string | null;
  actual_datetime: string;
  process_data: string | null;
  created_at: Date;
}

interface NewsFeedResponse {
  success: boolean;
  articles: NewsArticle[];
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  error?: string;
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchNewsFeed(currentPage);
  }, [currentPage]);

  const fetchNewsFeed = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news-feed?page=${page}&limit=20`);
      const data: NewsFeedResponse = await response.json();
      
      if (data.success) {
        setArticles(data.articles);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        setCurrentPage(data.currentPage);
      } else {
        setError(data.error || 'שגיאה בטעינת החדשות');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedArticles(new Set()); // Reset expanded articles when changing page
    }
  };

  const toggleArticleExpansion = (articleId: number) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        return dateTimeStr;
      }
      return format(date, 'dd/MM/yyyy HH:mm', { locale: he });
    } catch {
      return dateTimeStr;
    }
  };

  const cleanHebrewText = (text: string) => {
    if (!text) return '';
    
    let cleanText = text;
    
    // 1. Decode Unicode escape sequences (e.g., \u05db\u05d5\u05ea\u05e8\u05ea)
    cleanText = cleanText.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    // 2. Replace double backslashes with single backslashes (e.g., \\" -> \")
    cleanText = cleanText.replace(/\\\\/g, '\\');
    
    // 3. Remove any remaining single backslashes that are not part of valid JSON escapes (e.g., \" should become ")
    cleanText = cleanText.replace(/\\"/g, '"'); // Convert escaped quotes to actual quotes
    cleanText = cleanText.replace(/\\/g, ''); // Remove any other stray backslashes

    // 4. Replace escaped newlines with actual newlines for proper formatting
    cleanText = cleanText.replace(/\\n/g, '\n'); // Convert escaped newlines to actual newlines
    cleanText = cleanText.replace(/\\r/g, '\n'); // Convert escaped carriage returns to newlines
    cleanText = cleanText.replace(/\\t/g, '\t'); // Convert escaped tabs to actual tabs
    
    // 5. Clean up the "nn" pattern with actual newlines
    cleanText = cleanText.replace(/nn/g, '\n');
    
    // 6. Remove subheadings from the text
    cleanText = cleanText
      .replace(/כותרת אובייקטיבית\s*:?\s*/g, '')
      .replace(/פתיח\s*:?\s*/g, '')
      .replace(/עובדות מוסכמות\s*:?\s*/g, '')
      .replace(/הצגת כל הצדדים\s*:?\s*/g, '')
      .replace(/מה שחסר מהדיווח\s*:?\s*/g, '')
      .replace(/הקשר רחב\s*:?\s*/g, '')
      .replace(/סיכום מאוזן\s*:?\s*/g, '')
      .replace(/\n\s*\n/g, '\n'); // Remove extra line breaks
    
    // 7. Clean up multiple spaces but preserve newlines
    cleanText = cleanText.replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
    cleanText = cleanText.replace(/\n\s*\n\s*\n/g, '\n\n'); // Replace multiple newlines with double newlines
    
    return cleanText.trim();
  };

  const formatTextWithLineBreaks = (text: string) => {
    if (!text) return '';
    
    // Split by \n and create paragraphs
    const paragraphs = text.split(/\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length === 1) {
      // Single paragraph, just return with line breaks
      return text.replace(/\n/g, '<br />');
    }
    
    // Multiple paragraphs, wrap each in <p> tags
    return paragraphs.map(paragraph => 
      `<p class="mb-3 leading-relaxed">${paragraph.trim()}</p>`
    ).join('');
  };

  const parseProcessData = (processDataStr: string | null) => {
    if (!processDataStr) return null;
    
    console.log('Raw process_data received:', processDataStr.substring(0, 500) + '...');
    console.log('Total length:', processDataStr.length);
    
    try {
      // Simple approach: try to parse as-is first
      const data = JSON.parse(processDataStr);
      console.log('Successfully parsed JSON with keys:', Object.keys(data));
      return data;
    } catch (error) {
      console.log('Failed to parse JSON directly:', error);
      
      // If direct parsing fails, try to clean it up
      try {
        let cleanJson = processDataStr;
        
        // Remove problematic characters that might break JSON
        cleanJson = cleanJson.replace(/\\"/g, '"');
        cleanJson = cleanJson.replace(/\\\\/g, '\\');
        cleanJson = cleanJson.replace(/\n/g, ' ');
        cleanJson = cleanJson.replace(/\r/g, ' ');
        
        const data = JSON.parse(cleanJson);
        console.log('Successfully parsed cleaned JSON with keys:', Object.keys(data));
        return data;
      } catch (secondError) {
        console.log('Failed to parse cleaned JSON:', secondError);
        
        // Last resort: manual extraction
        try {
          const result: Record<string, unknown> = {};
          
          // Extract journalistic_article
          const journalisticMatch = processDataStr.match(/"journalistic_article":\s*"([^"]+)"/);
          if (journalisticMatch) {
            result.journalistic_article = journalisticMatch[1];
          }
          
          // Extract technical_analysis
          const technicalMatch = processDataStr.match(/"technical_analysis":\s*"([^"]+)"/);
          if (technicalMatch) {
            result.technical_analysis = technicalMatch[1];
          }
          
          // Extract research_notes
          const researchMatch = processDataStr.match(/"research_notes":\s*"([^"]+)"/);
          if (researchMatch) {
            result.research_notes = researchMatch[1];
          }
          
          // Extract is_relevant
          const relevantMatch = processDataStr.match(/"is_relevant":\s*(true|false)/);
          if (relevantMatch) {
            result.is_relevant = relevantMatch[1] === 'true';
          }
          
          if (Object.keys(result).length > 0) {
            console.log('Manually extracted fields:', Object.keys(result));
            return result;
          }
        } catch (extractionError) {
          console.log('Manual extraction failed:', extractionError);
        }
        
        return null;
      }
    }
  };

  const extractArticleStructure = (processData: Record<string, unknown>) => {
    console.log('Extracting article structure from:', processData);
    
    // Check for the new structure with journalistic_article
    if (processData?.journalistic_article && typeof processData.journalistic_article === 'string') {
      console.log('Found journalistic_article field');
      const journalisticText = processData.journalistic_article as string;
      
      console.log('Raw journalistic text:', journalisticText.substring(0, 300) + '...');
      
      // Remove subheadings from the text
      const cleanedText = journalisticText
        .replace(/כותרת אובייקטיבית\s*:?\s*/g, '')
        .replace(/פתיח\s*:?\s*/g, '')
        .replace(/עובדות מוסכמות\s*:?\s*/g, '')
        .replace(/הצגת כל הצדדים\s*:?\s*/g, '')
        .replace(/מה שחסר מהדיווח\s*:?\s*/g, '')
        .replace(/הקשר רחב\s*:?\s*/g, '')
        .replace(/סיכום מאוזן\s*:?\s*/g, '')
        .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
        .trim();
      
      console.log('Cleaned text (first 300 chars):', cleanedText.substring(0, 300) + '...');
      
      return {
        type: 'journalistic_article' as const,
        content: {
          headline: 'כותרת הכתבה',
          content: cleanedText
        }
      };
    }
    
    // Check if it's nested in analysis
    if (processData?.analysis && typeof processData.analysis === 'object' && processData.analysis !== null) {
      const analysis = processData.analysis as Record<string, unknown>;
      if (analysis.journalistic_article) {
        console.log('Found journalistic_article in nested analysis');
        return {
          type: 'journalistic_article' as const,
          content: analysis.journalistic_article
        };
      }
      
      if (analysis.article_structure) {
        console.log('Found old format with article_structure');
        return {
          type: 'article_structure' as const,
          content: analysis.article_structure
        };
      }
    }
    
    // Check if analysis is a string (old new format)
    if (processData?.analysis && typeof processData.analysis === 'string') {
      console.log('Found analysis as string (old new format)');
      return {
        type: 'journalistic_article' as const,
        content: {
          headline: 'ניתוח הכתבה',
          content: processData.analysis
        }
      };
    }
    
    // Check if analysis is an object with new structure (latest format)
    if (processData?.analysis && typeof processData.analysis === 'object' && processData.analysis !== null) {
      const analysis = processData.analysis as Record<string, unknown>;
      
      // Check for new structure with final_article
      if (analysis.final_article && typeof analysis.final_article === 'string') {
        console.log('Found new analysis format with final_article');
        return {
          type: 'journalistic_article' as const,
          content: {
            headline: 'כתבה מאוזנת',
            content: analysis.final_article
          }
        };
      }
    }
    
    console.log('No article structure found');
    return null;

  };

  const formatArticleStructure = (structure: Record<string, unknown>) => {
    if (!structure) return 'לא זמין מבנה כתבה';
    
    // Combine all content into one flowing text without subheadings
    const allContent = [
      structure.headline,
      structure.opening,
      structure.facts,
      structure.interpretation,
      structure.missing,
      structure.context,
      structure.summary
    ].filter(Boolean).join('\n\n');
    
    return (
      <div className="space-y-4">
        <div 
          className="text-lg leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: formatTextWithLineBreaks(cleanHebrewText(allContent))
          }}
        />
      </div>
    );
  };

  const handleRefresh = () => {
    fetchNewsFeed(currentPage);
  };

  const handleRetry = () => {
    fetchNewsFeed(currentPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-lg">טוען חדשות...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg mb-2">שגיאה בטעינת החדשות</div>
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">לא נמצאו כתבות מעובדות</div>
        <div className="text-gray-400 mt-2">נסה שוב מאוחר יותר</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">פיד חדשות מאוזן</h1>
        <p className="text-xl text-gray-600">כתבות מאוזנות עם מבנה מקצועי</p>
        <div className="text-sm text-gray-500 mt-2">
          {totalCount} כתבות זמינות • מתעדכן בזמן אמת
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            הקודם
          </button>
          <span className="text-gray-600">
            דף {currentPage} מתוך {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            הבא
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Article Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {article.title}
                </h2>
                <div className="text-sm text-gray-500 text-left min-w-fit">
                  {formatDateTime(article.actual_datetime)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  קרא כתבה מקורית →
                </a>
                
                <button
                  onClick={() => toggleArticleExpansion(article.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  {expandedArticles.has(article.id) ? 'הסתר פירוט מבנה' : 'הצג פירוט מבנה'}
                </button>
              </div>
            </div>

            {/* Article Content - Balanced Article Structure */}
            <div className="p-6">
              <div className="text-gray-700 leading-relaxed mb-4 text-lg">
                {(() => {
                  console.log('=== Processing article ===');
                  console.log('Article ID:', article.id);
                  console.log('Article title:', article.title);
                  console.log('Article process_data length:', article.process_data ? article.process_data.length : 0);
                  
                  const processData = parseProcessData(article.process_data);
                  console.log('Parsed process data:', processData);
                  
                  const structure = extractArticleStructure(processData);
                  console.log('Extracted structure:', structure);
                  
                  if (structure) {
                    if (structure.type === 'journalistic_article') {
                      // Display the new journalistic_article format
                      console.log('Rendering journalistic_article structure');
                      const content = structure.content as { headline?: string; content?: string; text?: string };
                      console.log('Headline:', content.headline);
                      console.log('Content preview:', content.content ? content.content.substring(0, 200) + '...' : 'no content');
                      
                      return (
                        <div className="space-y-4">
                          <div className="text-2xl font-bold text-gray-900 mb-4">
                            {content.headline || 'כותרת הכתבה'}
                          </div>
                          <div 
                            className="text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatTextWithLineBreaks(content.content || content.text || 'תוכן הכתבה')
                            }}
                          />
                        </div>
                      );
                    } else if (structure.type === 'article_structure') {
                      // Display the old article_structure format
                      console.log('Rendering article_structure format');
                      
                      // Combine all content into one flowing text without subheadings
                      const content = structure.content as { headline?: string; opening?: string; facts?: string; interpretation?: string; context?: string };
                      const allContent = [
                        content.headline,
                        content.opening,
                        content.facts,
                        content.interpretation,
                        content.context
                      ].filter(Boolean).join('\n\n');
                      
                      return (
                        <div className="space-y-4">
                          <div 
                            className="text-lg leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatTextWithLineBreaks(cleanHebrewText(allContent))
                            }}
                          />
                        </div>
                      );
                    }
                  }
                  console.log('No structure found, showing fallback');
                  return 'תוכן לא זמין';
                })()}
              </div>
            </div>

            {/* AI Analysis - Expandable */}
            {article.process_data && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="pt-4">
                  <button onClick={() => toggleArticleExpansion(article.id)} className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors mb-3">
                    {expandedArticles.has(article.id) ? 'הסתר פירוט נוסף' : 'הצג פירוט נוסף'}
                  </button>
                  {expandedArticles.has(article.id) && (
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">פירוט נוסף</h3>
                      {(() => {
                        const processData = parseProcessData(article.process_data);
                        if (processData) {
                          return (
                            <div className="space-y-4">
                               {/* Research Notes - Old format */}
                               {processData.research_notes && (
                                 <div className="bg-blue-50 p-3 rounded-lg">
                                   <h4 className="font-semibold text-blue-900 mb-2">הערות מחקר:</h4>
                                   <div 
                                     className="text-blue-800"
                                     dangerouslySetInnerHTML={{
                                       __html: formatTextWithLineBreaks(cleanHebrewText(processData.research_notes))
                                     }}
                                   />
                                 </div>
                               )}
                               
                               {/* Research - New format */}
                               {processData.analysis?.research && (
                                 <div className="bg-blue-50 p-3 rounded-lg">
                                   <h4 className="font-semibold text-blue-900 mb-2">מחקר:</h4>
                                   <div 
                                     className="text-blue-800"
                                     dangerouslySetInnerHTML={{
                                       __html: formatTextWithLineBreaks(cleanHebrewText(processData.analysis.research))
                                     }}
                                   />
                                 </div>
                               )}
                               
                               {/* Technical Analysis - Old format */}
                               {processData.technical_analysis && (
                                 <div className="bg-green-50 p-3 rounded-lg">
                                   <h4 className="font-semibold text-green-900 mb-2">ניתוח טכני:</h4>
                                   <div 
                                     className="text-green-800"
                                     dangerouslySetInnerHTML={{
                                       __html: formatTextWithLineBreaks(cleanHebrewText(processData.technical_analysis))
                                     }}
                                   />
                                 </div>
                               )}
                               
                               {/* Technical Analysis - New format */}
                               {processData.analysis?.technical_analysis && (
                                 <div className="bg-green-50 p-3 rounded-lg">
                                   <h4 className="font-semibold text-green-900 mb-2">ניתוח טכני:</h4>
                                   <div 
                                     className="text-green-800"
                                     dangerouslySetInnerHTML={{
                                       __html: formatTextWithLineBreaks(cleanHebrewText(processData.analysis.technical_analysis))
                                     }}
                                   />
                                 </div>
                               )}
                               
                               {/* Category and Reason - New format */}
                               {(processData.analysis?.category || processData.analysis?.reason) && (
                                 <div className="bg-purple-50 p-3 rounded-lg">
                                   <h4 className="font-semibold text-purple-900 mb-2">פרטי הכתבה:</h4>
                                   {processData.analysis.category && (
                                     <div className="mb-2">
                                       <strong>קטגוריה:</strong> {processData.analysis.category}
                                     </div>
                                   )}
                                   {processData.analysis.reason && (
                                     <div>
                                       <strong>סיבה לרלוונטיות:</strong> {processData.analysis.reason}
                                     </div>
                                   )}
                                 </div>
                               )}
                               
                               {/* Old format - Article Structure */}
                               {processData.analysis?.article_structure && (
                                 <div className="bg-purple-50 p-3 rounded-lg">
                                   <h4 className="font-semibold text-purple-900 mb-2">מבנה הכתבה הישן:</h4>
                                   <div className="text-purple-800">
                                     {formatArticleStructure(processData.analysis.article_structure)}
                                   </div>
                                 </div>
                               )}
                               
                               {/* Raw Process Data for debugging - HIDDEN */}
                               {/* <div className="bg-gray-100 p-3 rounded-lg">
                                 <h4 className="font-semibold text-gray-900 mb-2">נתונים גולמיים:</h4>
                                 <div className="text-gray-700 text-sm">
                                   <pre>{JSON.stringify(processData, null, 2)}</pre>
                                 </div>
                               </div> */}
                            </div>
                          );
                        }
                        return 'לא ניתן לטעון נתונים';
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          רענן חדשות
        </button>
      </div>
    </div>
  );
}

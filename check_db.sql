-- Check all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check news_items table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'news_items' 
ORDER BY ordinal_position;

-- Count records in news_items
SELECT COUNT(*) as total_news_items FROM news_items;

-- Count processed items
SELECT COUNT(*) as processed_items FROM news_items WHERE "isProcessed" = 1;

-- Show first few records
SELECT id, title, "isProcessed", created_at 
FROM news_items 
ORDER BY created_at DESC 
LIMIT 5;



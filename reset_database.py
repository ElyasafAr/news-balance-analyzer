#!/usr/bin/env python3
import sqlite3

def reset_database():
    """Reset all processed articles back to unprocessed state"""
    try:
        print("🧹 Resetting database to clean state...")
        
        # Connect to database
        conn = sqlite3.connect('rotter_news.db')
        cursor = conn.cursor()
        
        # Get current counts
        cursor.execute("SELECT COUNT(*) FROM news_items WHERE isProcessed = 1")
        processed_relevant_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM news_items WHERE isProcessed = 2")
        processed_non_relevant_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM news_items WHERE isProcessed = 0")
        unprocessed_count = cursor.fetchone()[0]
        
        print(f"📊 Current state:")
        print(f"   🔍 Relevant & processed: {processed_relevant_count}")
        print(f"   🚫 Non-relevant & marked: {processed_non_relevant_count}")
        print(f"   ⏳ Unprocessed: {unprocessed_count}")
        
        # Reset all processed articles back to unprocessed
        cursor.execute("""
            UPDATE news_items 
            SET isProcessed = 0, 
                process_data = NULL 
            WHERE isProcessed IN (1, 2)
        """)
        
        # Commit changes
        conn.commit()
        
        # Get new counts
        cursor.execute("SELECT COUNT(*) FROM news_items WHERE isProcessed = 0")
        new_unprocessed_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM news_items WHERE isProcessed = 1")
        new_processed_relevant_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM news_items WHERE isProcessed = 2")
        new_processed_non_relevant_count = cursor.fetchone()[0]
        
        print(f"\n✅ Reset completed!")
        print(f"📊 New state:")
        print(f"   🔍 Relevant & processed: {new_processed_relevant_count}")
        print(f"   🚫 Non-relevant & marked: {new_processed_non_relevant_count}")
        print(f"   ⏳ Unprocessed: {new_unprocessed_count}")
        
        # Close connection
        conn.close()
        
        print(f"\n🎉 Database has been reset to clean state!")
        print(f"   All articles are now marked as unprocessed (isProcessed = 0)")
        print(f"   All analysis data has been cleared")
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")

if __name__ == "__main__":
    print("🧹 Database Reset Tool")
    print("=" * 50)
    reset_database()

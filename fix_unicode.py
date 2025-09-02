#!/usr/bin/env python3
# -*- coding: utf-8
"""
Script to fix Unicode/Emoji issues in Python files for Windows compatibility
"""

import os
import re

# Mapping of emojis to text replacements
EMOJI_REPLACEMENTS = {
    '🚀': '[START]',
    '🔍': '[SEARCH]',
    '📊': '[STATS]',
    '📰': '[NEWS]',
    '⏳': '[WAIT]',
    '✅': '[OK]',
    '❌': '[ERROR]',
    '🕐': '[TIME]',
    '📝': '[WRITE]',
    '🧠': '[AI]',
    '🕷️': '[SPIDER]',
    '😴': '[SLEEP]',
    '📡': '[SIGNAL]',
    '💥': '[CRASH]',
    '⚠️': '[WARNING]',
    '🗄️': '[DATABASE]',
    '📈': '[PROGRESS]',
    '🚫': '[BLOCKED]',
    '✍️': '[WRITE]',
    '⏹️': '[STOP]'
}

def fix_unicode_in_file(filepath):
    """Fix Unicode issues in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace emojis with text
        for emoji, replacement in EMOJI_REPLACEMENTS.items():
            content = content.replace(emoji, replacement)
        
        # If content changed, write it back
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed Unicode issues in: {filepath}")
            return True
        else:
            print(f"No Unicode issues found in: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    print("Fixing Unicode/Emoji issues in Python files...")
    
    files_to_fix = [
        'filter_recent.py',
        'process_articles.py',
        'backend_runner.py'
    ]
    
    fixed_count = 0
    for filename in files_to_fix:
        if os.path.exists(filename):
            if fix_unicode_in_file(filename):
                fixed_count += 1
        else:
            print(f"File not found: {filename}")
    
    print(f"\nFixed Unicode issues in {fixed_count} files")
    print("Files should now work properly on Windows console")

if __name__ == "__main__":
    main()

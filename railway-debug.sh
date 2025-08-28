#!/bin/bash

echo "=== RAILWAY DEBUG SCRIPT ==="
echo "Timestamp: $(date)"
echo "Current directory: $(pwd)"
echo "User: $(whoami)"
echo ""

echo "=== ENVIRONMENT VARIABLES ==="
env | sort
echo ""

echo "=== DIRECTORY CONTENTS ==="
ls -la
echo ""

echo "=== PACKAGE.JSON EXISTS ==="
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "Content preview:"
    head -20 package.json
else
    echo "❌ package.json NOT found"
fi
echo ""

echo "=== NODE VERSION ==="
node --version
echo ""

echo "=== NPM VERSION ==="
npm --version
echo ""

echo "=== PYTHON VERSION ==="
python3 --version
echo ""

echo "=== DISK SPACE ==="
df -h
echo ""

echo "=== MEMORY USAGE ==="
free -h
echo ""

echo "=== DEBUG COMPLETE ==="

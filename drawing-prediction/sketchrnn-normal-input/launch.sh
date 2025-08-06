#!/bin/bash

# SketchRNN Drawing Prediction - Launch Script
# This script starts a local web server to run the application

echo "🎨 Starting SketchRNN Drawing Prediction Server..."
echo "=============================================="

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python..."
    python -m http.server 8000
else
    echo "❌ Error: Python is not installed"
    echo "Please install Python or use an alternative web server"
    echo ""
    echo "Alternative commands:"
    echo "- Node.js: npx http-server"
    echo "- PHP: php -S localhost:8000"
    echo "- Or use any other local web server"
    exit 1
fi

echo ""
echo "🚀 Server started successfully!"
echo "📱 Open your browser and navigate to:"
echo "   http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
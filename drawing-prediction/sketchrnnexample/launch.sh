#!/bin/bash

# SketchRNN AI Drawing Studio - Launch Script
echo "🎨 Starting SketchRNN AI Drawing Studio..."
echo "📍 Location: $(pwd)"
echo "🌐 Server will be available at: http://localhost:8003"
echo ""
echo "🎯 Features in this enhanced version:"
echo "   • Full-screen responsive canvas"
echo "   • 12+ AI drawing models (bird, cat, dog, flower, etc.)"
echo "   • Temperature control for AI creativity"
echo "   • Modern UI with collapsible sidebar"
echo "   • Touch support for mobile devices"
echo "   • Save drawings as PNG files"
echo "   • Keyboard shortcuts (C=clear, R=random, S=save)"
echo ""
echo "🚀 Opening in browser..."
echo "   If it doesn't open automatically, visit: http://localhost:8003"
echo ""

# Start Python HTTP server
python3 -m http.server 8003

echo ""
echo "✨ Thank you for using SketchRNN AI Drawing Studio!"
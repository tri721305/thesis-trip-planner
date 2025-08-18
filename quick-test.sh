#!/bin/bash

# Simple test script to start dev server and open test instructions
echo "🚀 Starting development server..."
cd "/Users/mac/Desktop/HCMUT/Thesis/source"

# Start the dev server in background
npm run dev &
DEV_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

echo "📖 Opening debug instructions..."
echo "=================================================================================="
echo "🔧 MAP MARKER DEBUG TEST INSTRUCTIONS"
echo "=================================================================================="
echo ""
echo "1. Open browser to: http://localhost:3000"
echo "2. Open Developer Console (F12)"
echo "3. Navigate to a planner page"
echo "4. Try these test actions:"
echo ""
echo "   ✅ ADD A PLACE:"
echo "      - Click 'Add Place' in any day section"
echo "      - Look for console logs like:"
echo "        🔄 PlannerForm - Notifying parent of form change"
echo "        🔄 CustomScrollLayoutPlanner - Received form data update"
echo "        🗺️ Map component - Places data"
echo ""
echo "   ✅ REMOVE A PLACE:"
echo "      - Click the 'X' button on any place item"
echo "      - Look for console logs like:"
echo "        🗑️ Item being removed"
echo "        🔄 PlannerForm - Notifying parent of removeItem change"
echo "        🔍 useEffect triggered with dependencies"
echo ""
echo "5. Check if Map markers appear/disappear correctly"
echo ""
echo "Expected Console Log Pattern:"
echo "🔄 → 🔍 → 🗺️ → 🎯"
echo ""
echo "If you see gaps in this chain, that's where the issue is!"
echo ""
echo "=================================================================================="
echo "Press Ctrl+C to stop the server"
echo "=================================================================================="

# Wait for user to stop
wait $DEV_PID

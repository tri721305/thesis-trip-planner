#!/bin/bash

echo "🔧 MAP MARKER DEBUG - SIMPLE TEST"
echo "================================="

# Navigate to the project directory
cd "/Users/mac/Desktop/HCMUT/Thesis/source"

echo ""
echo "📋 TESTING CHECKLIST:"
echo "1. Start dev server"
echo "2. Open a planner page in browser"
echo "3. Open browser console (F12)"
echo "4. Look for these patterns:"
echo ""
echo "✅ Expected logs when adding a place:"
echo "   🔄 PlannerForm - Notifying parent of form change"
echo "   🔄 CustomScrollLayoutPlanner - Received form data update"
echo "   🔍 useEffect triggered with dependencies"
echo "   🗺️ Map component - Places data"
echo ""
echo "✅ Expected logs when removing a place:"
echo "   🗑️ Item being removed"
echo "   🔄 PlannerForm - Notifying parent of removeItem change"
echo "   🔍 useEffect triggered with dependencies"
echo "   🗺️ Map component - Places data"
echo ""
echo "❌ If any of these logs are missing, that's where the issue is!"
echo ""

# Start the development server
echo "🚀 Starting development server..."
npm run dev

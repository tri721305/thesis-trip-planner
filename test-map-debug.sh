#!/bin/bash

echo "🚀 Starting Map Marker Debug Test..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project root directory"
    exit 1
fi

echo "✅ In project directory"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting development server..."
npm run dev &

# Get the PID of the npm process
DEV_PID=$!

echo "🌐 Development server started with PID: $DEV_PID"
echo "📝 Server should be running at http://localhost:3000"
echo ""
echo "🧪 Debug Test Instructions:"
echo "1. Navigate to a planner detail page (e.g., http://localhost:3000/planners/[id])"
echo "2. Open browser console (F12)"
echo "3. Paste the debug script from debug-map-markers.js"
echo "4. Follow the test instructions in console"
echo ""
echo "🔍 Look for these debug logs when adding/removing places:"
echo "   🔍 DEBUG - handlePlaceSelect:"
echo "   🗑️ removeItem called:"
echo "   🔄 PlannerForm - Notifying parent of..."
echo "   🔄 CustomScrollLayoutPlanner - Received form data update:"
echo "   🔄 CustomScrollLayoutPlanner - Applied IMMEDIATE form data update"
echo "   🔍 useEffect triggered with dependencies:"
echo "   🗺️ Extracted places for map with coordinates:"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for user to stop
wait $DEV_PID

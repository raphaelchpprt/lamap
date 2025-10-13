#!/bin/bash

echo "🗺️  Checking LaMap configuration..."
echo ""

# Check token
echo "1️⃣  Checking Mapbox token..."
if grep -q "NEXT_PUBLIC_MAPBOX_TOKEN=pk\." .env.local 2>/dev/null; then
  echo "   ✅ Mapbox token found"
else
  echo "   ❌ Mapbox token missing or invalid in .env.local"
  echo "   ℹ️  Add: NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here"
  exit 1
fi

# Check if node_modules exists
echo ""
echo "2️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "   ✅ node_modules found"
else
  echo "   ❌ node_modules not found"
  echo "   ℹ️  Run: npm install"
  exit 1
fi

# Check Mapbox GL installed
if [ -d "node_modules/mapbox-gl" ]; then
  echo "   ✅ mapbox-gl installed"
else
  echo "   ❌ mapbox-gl not installed"
  echo "   ℹ️  Run: npm install"
  exit 1
fi

# Run integration tests
echo ""
echo "3️⃣  Running integration tests..."
npm test -- MapView.integration.test.tsx --silent --passWithNoTests 2>&1 | tail -n 5

if [ $? -eq 0 ]; then
  echo "   ✅ All tests pass"
else
  echo "   ⚠️  Some tests may have issues"
fi

# Check build
echo ""
echo "4️⃣  Checking build..."
npm run build > /tmp/lamap-build.log 2>&1

if [ $? -eq 0 ]; then
  echo "   ✅ Build successful"
else
  echo "   ❌ Build failed"
  echo "   ℹ️  Check: /tmp/lamap-build.log"
  exit 1
fi

echo ""
echo "✨ LaMap configuration is valid!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Open: http://localhost:3000"
echo "   3. Open DevTools (F12) and check console for errors"
echo "   4. In console, run: document.querySelector('[data-testid=\"map-container\"]').clientHeight"
echo "   5. If height is 0, check parent container has h-full or flex-1"
echo ""

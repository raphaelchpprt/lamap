# 🗺️ Map Display Troubleshooting Guide

## Problem

Map component not displaying or appearing blank in the browser.

## Potential Causes & Solutions

### 1. Missing Mapbox Token ⚠️

**Check:**
```bash
cat .env.local | grep NEXT_PUBLIC_MAPBOX_TOKEN
```

**Fix:**
```bash
# Add to .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Verify:**
- Token should start with `pk.`
- Check Mapbox dashboard: https://account.mapbox.com/
- Ensure token has proper permissions (Public)

### 2. CSS Height Issue 📏

**Problem:** Map container has no height (collapsed to 0px)

**Check in browser DevTools:**
```javascript
document.querySelector('[data-testid="map-container"]').clientHeight
```

**Fix:** Ensure parent containers have height:
```tsx
// page.tsx
<div className="h-screen w-screen overflow-hidden">
  <MapView />
</div>

// MapView.tsx  
<main className="relative flex-1"> {/* flex-1 is crucial! */}
  <Map className="h-full w-full" />
</main>
```

### 3. JavaScript Errors 🐛

**Check browser console:**
- Open DevTools (F12)
- Look for red errors
- Common errors:
  - `Cannot read property 'setData' of undefined` → Source not created
  - `accessToken must be set` → Missing token
  - `Container is not defined` → Ref not attached

**Fix:** Check component mounting:
```tsx
useEffect(() => {
  if (!mapContainer.current || map.current) return;
  // Initialize map...
}, []); // Empty deps = run once on mount
```

### 4. Mapbox GL CSS Not Loaded 🎨

**Check:** 
```tsx
// Map.tsx should have:
import 'mapbox-gl/dist/mapbox-gl.css';
```

**Verify in browser:** Map controls (zoom, compass) should be styled

### 5. Network Issues 🌐

**Check Network tab:**
- Mapbox tiles loading? (look for `api.mapbox.com` requests)
- 401/403 errors? → Invalid token
- Slow/timeout? → Network issues

**Fix:** Test internet connection and Mapbox status

### 6. React StrictMode Double Render 🔄

**Problem:** Map initializes twice in development

**Check:** Look for double initialization logs

**Fix:** Guard against double initialization:
```tsx
useEffect(() => {
  if (!mapContainer.current || map.current) return; // Guard here!
  
  map.current = new mapboxgl.Map({...});
  
  return () => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };
}, []);
```

## Testing Checklist ✅

### Manual Tests

1. **Visual Inspection:**
   - [ ] Map tiles load
   - [ ] Zoom controls visible
   - [ ] Compass visible
   - [ ] Fullscreen button visible
   - [ ] Geolocate button visible

2. **Interaction Tests:**
   - [ ] Click and drag to pan
   - [ ] Scroll to zoom
   - [ ] Click zoom +/- buttons
   - [ ] Double-click to zoom in
   - [ ] Right-click drag to rotate

3. **Data Tests:**
   - [ ] Markers appear (if initiatives loaded)
   - [ ] Cluster count shows
   - [ ] Click marker opens popup

### Automated Tests

Run integration tests:
```bash
npm test -- MapView.integration.test.tsx
```

Should pass:
- ✅ Map container rendering (with dimensions)
- ✅ Map initialization
- ✅ Initiative loading
- ✅ Filter integration
- ✅ Error handling
- ✅ User interactions
- ✅ Responsive layout

## Debugging Commands 🔧

### 1. Check environment variables
```bash
npm run dev 2>&1 | grep MAPBOX
```

### 2. Verify build
```bash
npm run build
# Look for any map-related errors
```

### 3. Test in production mode
```bash
npm run build && npm start
# Open http://localhost:3000
```

### 4. Check map dimensions in console
```javascript
// In browser console:
const mapEl = document.querySelector('[data-testid="map-container"]');
console.log({
  height: mapEl.clientHeight,
  width: mapEl.clientWidth,
  classes: mapEl.className,
  parent: {
    height: mapEl.parentElement.clientHeight,
    width: mapEl.parentElement.clientWidth
  }
});
```

## Quick Fix Script 🚀

Create `scripts/check-map.sh`:
```bash
#!/bin/bash

echo "🗺️  Checking LaMap configuration..."

# Check token
if grep -q "NEXT_PUBLIC_MAPBOX_TOKEN=pk\." .env.local; then
  echo "✅ Mapbox token found"
else
  echo "❌ Mapbox token missing or invalid"
  exit 1
fi

# Run tests
echo "\n🧪 Running integration tests..."
npm test -- MapView.integration.test.tsx --silent

if [ $? -eq 0 ]; then
  echo "✅ All tests pass"
else
  echo "❌ Tests failing"
  exit 1
fi

# Check build
echo "\n🏗️  Checking build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

echo "\n✨ LaMap is ready to go!"
```

## Prevention Strategy 🛡️

### 1. Pre-commit Hook

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm test -- MapView.integration.test.tsx --silent
```

### 2. CI/CD Integration

Add to `.github/workflows/test.yml`:
```yaml
- name: Test Map Integration
  run: npm test -- MapView.integration.test.tsx
```

### 3. Development Checklist

Before committing map changes:
- [ ] Visual test in browser
- [ ] Integration tests pass
- [ ] Check browser console (no errors)
- [ ] Test with real initiatives data
- [ ] Test on different screen sizes

## Common Solutions Summary 📝

| Problem | Quick Fix |
|---------|-----------|
| Blank map | Check token in `.env.local` |
| Map not sized | Ensure parent has `h-full` or `flex-1` |
| Controls missing | Import `mapbox-gl/dist/mapbox-gl.css` |
| Double initialization | Add guard `if (map.current) return` |
| Tiles not loading | Check network tab for 401/403 |
| Slow rendering | Enable clustering, limit zoom |

## Need Help? 🆘

1. Check browser console first
2. Run integration tests
3. Verify `.env.local` configuration
4. Check network tab for API errors
5. Review this troubleshooting guide

## Resources 📚

- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/api/)
- [React + Mapbox Best Practices](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)
- [Troubleshooting Guide](https://docs.mapbox.com/help/troubleshooting/)

---

*Last updated: 2025-10-13*

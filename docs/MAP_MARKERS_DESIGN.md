# 🗺️ Map Markers Design System

**Last Updated:** 2025-10-26  
**Design System:** Glassmorphism with 13 distinctive colors

---

## 🎨 Design Principles

Our map markers follow the same glassmorphism design system as the rest of the application:

- **White transparent backgrounds** with blur effects
- **Layered green shadows** for modern premium look
- **13 distinctive colors** for initiative types
- **WCAG AAA accessibility** compliance
- **Smooth animations** and transitions

---

## 🌡️ Heatmap (Zoom < 9)

**Purpose:** Show density of initiatives at low zoom levels  
**Visibility:** Zoom 0-9, fades out at zoom 7-9

### Color Gradient (Modern Eco-Tech)
```css
0%   → Transparent emerald      rgba(16, 185, 129, 0)
20%  → Light emerald            rgba(16, 185, 129, 0.4)
40%  → Teal                     rgba(20, 184, 166, 0.6)
60%  → Blue                     rgba(59, 130, 246, 0.8)
80%  → Amber                    rgba(245, 158, 11, 0.9)
100% → Red (high density)       rgba(239, 68, 68, 1)
```

### Properties
- **Intensity:** 1.2 (zoom 0) → 3.5 (zoom 9)
- **Radius:** 3px (zoom 0) → 25px (zoom 9)
- **Opacity:** 1 (zoom 7) → 0 (zoom 9)

---

## 🎯 Cluster Markers (Zoom 9-14)

**Purpose:** Group nearby initiatives for better performance  
**Visibility:** Zoom 9-14, disabled at zoom 14+

### Glassmorphism Style

#### Outer Glow Layer
- **Purpose:** Soft shadow/halo effect
- **Color:** Emerald (#10b981)
- **Opacity:** 0.2
- **Blur:** 1px
- **Radius:** Main radius + 4px

#### Main Circle
- **Background:** Color based on density (emerald/blue/amber/red)
- **Opacity:** 0.92 (glassmorphism)
- **Stroke:** 3px white (rgba(255, 255, 255, 0.95))

#### Density Colors
```javascript
1-50 points    → Emerald  #10b981
50-100 points  → Blue     #3b82f6
100-500 points → Amber    #f59e0b
500+ points    → Red      #ef4444
```

#### Sizes by Density
```javascript
1-50 points    → 18px (glow: 22px)
50-100 points  → 28px (glow: 32px)
100-500 points → 38px (glow: 42px)
500+ points    → 48px (glow: 52px)
```

#### Text Label
- **Font:** DIN Offc Pro Bold, 15px
- **Color:** White #ffffff
- **Halo:** Black rgba(0, 0, 0, 0.3) with 1.5px width

---

## 📍 Individual Point Markers (Zoom 9+)

**Purpose:** Show exact location of each initiative  
**Visibility:** Zoom 9+ (full zoom range)

### Glassmorphism Style

#### Outer Glow Layer
- **Purpose:** Soft colored shadow matching marker type
- **Opacity:** 0.15
- **Blur:** 1px
- **Radius:** Main radius + 2-4px

#### Main Circle
- **Background:** Type-specific color (13 distinctive colors)
- **Opacity:** 0.95 (glassmorphism)
- **Stroke:** 3.5px white (rgba(255, 255, 255, 0.95))

### 13 Distinctive Colors

Each initiative type has a unique color for instant recognition:

| Type | Color | Hex | Semantic Meaning |
|------|-------|-----|------------------|
| **Ressourcerie** | Slate Gray | `#64748b` | Recycling/Reuse |
| **Repair Café** | Amber | `#f59e0b` | Tools/Repair |
| **AMAP** | Emerald | `#10b981` | Agriculture/Food |
| **Entreprise d'insertion** | Blue | `#3b82f6` | Social/Employment |
| **Point de collecte** | Purple | `#8b5cf6` | Collection Point |
| **Recyclerie** | Teal | `#14b8a6` | Recycling Center |
| **Épicerie sociale** | Pink | `#ec4899` | Social Grocery |
| **Jardin partagé** | Lime | `#84cc16` | Gardens/Nature |
| **Fab Lab** | Violet | `#7c3aed` | Tech/Making |
| **Coopérative** | Sky Blue | `#0ea5e9` | Cooperative |
| **Monnaie locale** | Yellow | `#eab308` | Currency/Exchange |
| **Tiers-lieu** | Fuchsia | `#d946ef` | Third Place/Coworking |
| **Autre** | Gray | `#6b7280` | Other/Misc |

### Sizes by Zoom Level
```javascript
Zoom 8  → 6px  (glow: 8px)
Zoom 12 → 11px (glow: 14px)
Zoom 16 → 16px (glow: 20px)
```

### Text Labels (Zoom 13+)
- **Font:** Open Sans Regular, 11px
- **Color:** Dark gray #1f2937
- **Offset:** [0, 1.5] (below marker)
- **Halo:** White #ffffff with 1.5px width, 0.5px blur
- **Max Width:** 10em (word wrap)

---

## 🎭 Hover Effects

### Popup on Hover
When hovering over an individual marker:

1. **Hover Popup Appears**
   - Modern glassmorphism style (same as click popup)
   - White background rgba(255, 255, 255, 0.92)
   - Blur 24px with 180% saturation
   - Layered green shadows
   
2. **Cursor Changes**
   - Pointer cursor indicates interactivity

3. **Popup Auto-Hides**
   - Removed when mouse leaves marker
   - Also removed when marker is clicked

### Click Interactions

#### Cluster Click
- **Action:** Zoom to expand cluster
- **Animation:** Smooth easeTo transition
- **Zoom Level:** Calculated by Mapbox (optimal expansion)

#### Marker Click
- **Action:** Show full initiative details
- **Callback:** `onInitiativeClick(initiative)`
- **Hover Popup:** Automatically removed

#### Map Click (empty area)
- **Action:** Optional callback for adding new initiative
- **Callback:** `onMapClick([lng, lat])`

---

## 🎨 CSS Classes

### Hover Popup
```css
.hover-popup .mapboxgl-popup-content {
  pointer-events: none; /* Don't block clicks */
}

.hover-popup .mapboxgl-popup-close-button {
  display: none; /* No close button on hover */
}
```

### Main Popup (Click)
```css
.mapboxgl-popup-content {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 8px 32px rgba(16, 185, 129, 0.25), 
    0 4px 16px rgba(16, 185, 129, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
}

.mapboxgl-popup-content:hover {
  box-shadow: 
    0 12px 48px rgba(16, 185, 129, 0.35), 
    0 6px 24px rgba(16, 185, 129, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.7) inset;
  transform: translateY(-2px);
}
```

---

## 🔧 Technical Implementation

### Layer Order (Bottom to Top)
1. `world-mask` - Gray out other countries
2. `heatmap` - Density visualization (zoom < 9)
3. `clusters-glow` - Cluster outer glow
4. `clusters` - Cluster circles
5. `cluster-count` - Cluster numbers
6. `unclustered-point-glow` - Marker outer glow
7. `unclustered-point` - Individual markers
8. `unclustered-point-label` - Marker labels (zoom 13+)

### Data Source
```javascript
{
  type: 'geojson',
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 60,
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          id: 'uuid',
          name: 'Initiative Name',
          type: 'InitiativeType',
          verified: true,
          initiative: JSON.stringify(fullData)
        }
      }
    ]
  }
}
```

### Performance Optimizations
- **Viewport-based loading:** Only load initiatives in current view
- **Adaptive limits:** Different max counts by zoom (50k/30k/10k)
- **Debounce:** 500ms delay before reloading on map move
- **Clustering:** Enabled by default, reduces markers at low zoom

---

## ♿ Accessibility

### Color Contrast
- **Marker Colors:** All 13 colors tested for visibility on light background
- **Text Labels:** Dark text (#1f2937) with white halo for readability
- **Cluster Numbers:** White text with black halo for WCAG AAA compliance

### Keyboard Navigation
- **Markers:** Not keyboard-focusable (use sidebar list for keyboard access)
- **Controls:** Mapbox navigation controls are keyboard-accessible

### Screen Reader Support
- **Marker Labels:** Text labels provide context at high zoom
- **Alternative:** Sidebar initiative list provides full screen reader support

---

## 🎯 Future Enhancements

### Potential Improvements
- [ ] Custom marker shapes by type (SVG markers)
- [ ] Animated transitions when markers appear/disappear
- [ ] Marker clustering with custom icons showing mix of types
- [ ] Heat map with type-specific colors
- [ ] Pulsing animation for verified initiatives
- [ ] 3D marker elevation based on importance

### Advanced Features
- [ ] Dynamic marker size based on importance score
- [ ] Custom marker icons with type-specific SVG designs
- [ ] Route visualization between related initiatives
- [ ] Temporal heatmap showing initiative creation over time

---

## 📚 Related Documentation

- [UI Design System](./UI_DESIGN.md)
- [Map Configuration](./MAP_CONFIG.md)
- [Type Definitions](../src/types/initiative.ts)
- [Glassmorphism Styles](../src/app/globals.css)

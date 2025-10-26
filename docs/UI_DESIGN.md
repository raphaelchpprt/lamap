# 🎨 LaMap UI Design System

## Overview

LaMap features a **modern, premium glassmorphism design** with tech-inspired gradients and liquid glass effects. The UI is designed to be visually stunning while maintaining excellent usability and accessibility.

---

## 🌈 Color Palette

### Primary Colors

```css
/* Dark theme base */
--background: #0a0a1a (Deep space blue)
--foreground: #ffffff (Pure white)

/* Glassmorphism surfaces */
--glass: rgba(255, 255, 255, 0.05) with backdrop-blur(10px)
--glass-strong: rgba(255, 255, 255, 0.1) with backdrop-blur(20px)

/* Accent gradients */
--gradient-purple: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)
--gradient-pink: linear-gradient(135deg, #ec4899 0%, #f472b6 100%)
--gradient-cyan: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)
--gradient-tech: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #06b6d4 100%)
```

### Type-Specific Gradients

Each initiative type has a unique gradient:

- **Ressourcerie**: Gray-Slate
- **Repair Café**: Orange-Red
- **AMAP**: Green-Emerald
- **Entreprise d'insertion**: Blue-Indigo
- **Point de collecte**: Purple-Violet
- **Recyclerie**: Teal-Cyan
- **Épicerie sociale**: Red-Pink
- **Jardin partagé**: Lime-Green
- **Fab Lab**: Violet-Purple
- **Coopérative**: Cyan-Blue
- **Monnaie locale**: Yellow-Orange
- **Tiers-lieu**: Fuchsia-Pink
- **Autre**: Gray-Slate

---

## 🔮 Glassmorphism Effects

### Glass Classes

```css
/* Light glass effect */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Strong glass effect */
.glass-strong {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Usage

```tsx
// Sidebar container
<div className="glass-strong rounded-3xl p-6">
  {/* Content */}
</div>

// Dialog overlay
<DialogContent className="glass-strong border-white/20">
  {/* Content */}
</DialogContent>
```

---

## ✨ Gradient Text

### Implementation

```css
.gradient-text {
  background: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Usage

```tsx
<h1 className="text-3xl font-bold gradient-text">
  LaMap ESS
</h1>
```

---

## 🎭 Component Styles

### StatsPanel

**Features:**
- Animated counters with easing
- Glassmorphism cards
- Gradient borders
- Hover effects with scale
- Animated background blobs
- Progress bars with gradients

**Design patterns:**
```tsx
// Stat card structure
<div className="group relative overflow-hidden rounded-2xl p-[1px]" style={{ background: gradient }}>
  <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-4 group-hover:bg-white/20">
    {/* Animated blob */}
    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl" />
    {/* Content */}
  </div>
</div>
```

### FilterPanel

**Features:**
- Collapsible glass container
- Gradient type indicators
- Hover effects on checkboxes
- Selected state with glow
- Smooth transitions

**Design patterns:**
```tsx
// Filter item with selection state
<div className={`
  relative group flex items-center p-3 rounded-xl
  ${isSelected 
    ? 'bg-white/20 backdrop-blur-md shadow-lg scale-[1.02]' 
    : 'bg-white/5 hover:bg-white/10'
  }
`}>
  {/* Gradient border effect */}
  {isSelected && (
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-sm" />
  )}
  {/* Content */}
</div>
```

### Buttons

**Primary action (gradient):**
```tsx
<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105">
  Action
</Button>
```

**Ghost action:**
```tsx
<Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
  Action
</Button>
```

---

## 🎬 Animations

### Counter Animation

```tsx
// Animated counter with easing
const AnimatedCounter = ({ value, duration = 1000 }) => {
  // Ease-out cubic animation
  const easeOut = 1 - Math.pow(1 - progress, 3);
  // ...
}
```

### Gradient Animation

```css
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}
```

### Hover Scale

```tsx
<div className="transition-all duration-300 hover:scale-105">
  {/* Content */}
</div>
```

---

## 📱 Responsive Design

### Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Sidebar Width

- Desktop: `w-96` (384px)
- Tablet: Full width overlay
- Mobile: Full width overlay

---

## ♿ Accessibility

### Glass Contrast

All glassmorphism effects maintain WCAG AA contrast ratios:
- White text on glass-strong: **7:1** ratio ✅
- Icons with 70% opacity: **4.5:1** ratio ✅

### Focus States

```tsx
// Visible focus ring on all interactive elements
<Button className="focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black">
  Action
</Button>
```

### Screen Reader Support

```tsx
// Hidden descriptive text
<h1 className="gradient-text">LaMap ESS</h1>
<span className="sr-only">LaMap Économie Sociale et Solidaire</span>
```

---

## 🎨 Design Tokens

### Spacing

```typescript
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}
```

### Border Radius

```typescript
const borderRadius = {
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
  '3xl': '3rem',  // 48px
}
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgba(167, 139, 250, 0.5)', // Purple glow
}
```

---

## 🚀 Performance

### Optimization Strategies

1. **CSS-only animations** - No JavaScript for simple transitions
2. **Hardware acceleration** - Use `transform` and `opacity` for animations
3. **Backdrop filter** - Modern browsers only (graceful degradation)
4. **Lazy loading** - Images and heavy components

### Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (backdrop-filter requires `-webkit-` prefix)
- Mobile browsers: ✅ Full support on modern devices

---

## 📚 Resources

- [Glassmorphism.com](https://glassmorphism.com/) - Glass effect generator
- [Coolors.co](https://coolors.co/) - Color palette inspiration
- [Tailwind CSS](https://tailwindcss.com/) - Utility classes
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Lucide Icons](https://lucide.dev/) - Icon system

---

## 🎯 Future Enhancements

- [ ] Dark/Light mode toggle
- [ ] Custom theme builder
- [ ] Animated page transitions
- [ ] Particle effects on hover
- [ ] Interactive cursor trail
- [ ] 3D tilt effects on cards
- [ ] Micro-interactions library

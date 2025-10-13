# 📦 Dependencies to Install for LaMap

This file lists all dependencies required for LaMap to function properly.

## ✅ Already Installed Dependencies

The following dependencies are already present in `package.json`:

### Production
- ✅ `next` (15.x)
- ✅ `react` (19.x)
- ✅ `react-dom` (19.x)
- ✅ `@supabase/ssr`
- ✅ `@supabase/supabase-js`
- ✅ `mapbox-gl`

### Development
- ✅ `@testing-library/jest-dom`
- ✅ `@testing-library/react`
- ✅ `@types/mapbox-gl`
- ✅ `@types/node`
- ✅ `@types/react`
- ✅ `@types/react-dom`
- ✅ `@tailwindcss/forms`
- ✅ `@tailwindcss/typography`
- ✅ `eslint`
- ✅ `eslint-config-next`
- ✅ `jest`
- ✅ `jest-environment-jsdom`
- ✅ `postcss`
- ✅ `tailwindcss`
- ✅ `typescript`

## 📋 Missing Dependencies to Install

### 1. CSS Utilities

```bash
npm install clsx tailwind-merge
```

**Usage:**
- `clsx`: Conditional CSS class construction
- `tailwind-merge`: Smart Tailwind class merging (prevents conflicts)

**Where used:**
- `src/lib/utils.ts` (`cn()` function)
- All components for combining conditional classes

---

### 2. Form Validation (recommended)

```bash
npm install zod react-hook-form @hookform/resolvers
```

**Usage:**
- `zod`: TypeScript-first schema validation
- `react-hook-form`: Performant form management
- `@hookform/resolvers`: Zod integration with React Hook Form

**Future usage example:**
```tsx
// src/schemas/initiative.ts
import { z } from 'zod'

export const initiativeSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  type: z.enum(['Ressourcerie', 'AMAP', ...]),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
})
```

---

### 3. Icons (recommended)

```bash
npm install lucide-react
```

**Usage:**
- Modern, lightweight, and tree-shakeable icon library
- Compatible with React and TypeScript

**Usage example:**
```tsx
import { MapPin, Plus, Filter, Search } from 'lucide-react'

<MapPin className="w-5 h-5 text-primary-500" />
```

---

### 4. Date Management (if needed)

```bash
npm install date-fns
```

**Usage:**
- Date manipulation and formatting (alternative to `utils.ts`)
- More complete than custom functions

**Example:**
```tsx
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

format(new Date(), 'PPP', { locale: fr })
formatDistanceToNow(date, { locale: fr, addSuffix: true })
```

---

### 5. Toast Notifications (recommended)

```bash
npm install sonner
```

**Usage:**
- Elegant and accessible toast notifications
- Simple API, compatible with Next.js

**Example:**
```tsx
import { toast } from 'sonner'

toast.success('Initiative added successfully!')
toast.error('An error occurred')
```

---

### 6. HTML Sanitization (security)

```bash
npm install isomorphic-dompurify
```

**Usage:**
- Sanitize user inputs containing HTML
- Protection against XSS attacks

---

### 7. Bundle Analysis (development)

```bash
npm install --save-dev @next/bundle-analyzer
```

**Configuration in `next.config.ts`:**
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... config
})
```

**Usage:**
```bash
ANALYZE=true npm run build
```

---

### 8. Geocoding (Address API)

No dependency required, use the free French government API:

```typescript
// src/lib/geocoding.ts
export async function geocodeAddress(address: string) {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}`
  )
  const data = await response.json()
  return data.features[0]?.geometry.coordinates // [lon, lat]
}
```

---

## 🚀 Complete Recommended Installation

To install all recommended dependencies in one command:

```bash
npm install \
  clsx \
  tailwind-merge \
  zod \
  react-hook-form \
  @hookform/resolvers \
  lucide-react \
  sonner \
  isomorphic-dompurify

npm install --save-dev \
  @next/bundle-analyzer
```

---

## 📝 Minimal Installation (essentials only)

If you want to start with the bare minimum:

```bash
npm install clsx tailwind-merge lucide-react
```

These three packages are essential for:
- `clsx` + `tailwind-merge`: Used in `src/lib/utils.ts`
- `lucide-react`: Icons used in components

---

## ⚙️ Optional Dependencies (install as needed)

### Social Authentication
```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### Charts and Visualizations
```bash
npm install recharts
```

### Global State Management (if needed)
```bash
npm install zustand
# or
npm install jotai
```

### Drag & Drop
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### Markdown
```bash
npm install react-markdown remark-gfm
```

---

## 🔍 Check Installed Versions

```bash
npm list --depth=0
```

---

## 🧹 Clean Up Unused Dependencies

```bash
npm install -g depcheck
depcheck
```

---

## 📚 Package Documentation

- [clsx](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [zod](https://zod.dev/)
- [react-hook-form](https://react-hook-form.com/)
- [lucide-react](https://lucide.dev/)
- [sonner](https://sonner.emilkowal.ski/)
- [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify)
- [date-fns](https://date-fns.org/)

---

**Last updated:** October 10, 2025

````

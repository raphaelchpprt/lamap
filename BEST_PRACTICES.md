# 📖 Best Practices Guide - LaMap

This document centralizes all development best practices for LaMap, based on modern web standards in 2025.

## 📋 Table of Contents

- [Next.js & React](#nextjs--react)
- [TypeScript](#typescript)
- [Tailwind CSS](#tailwind-css)
- [Testing with Jest](#testing-with-jest)
- [Accessibility (a11y)](#accessibility-a11y)
- [Performance](#performance)
- [Security](#security)
- [Git & Versioning](#git--versioning)

---

## Next.js & React

### Server Components by default

✅ **DO**
```tsx
// By default, all components are Server Components
export default async function InitiativeList() {
  const supabase = await createClient()
  const { data: initiatives } = await supabase.from('initiatives').select()
  
  return <div>{/* ... */}</div>
}
```

❌ **DON'T**
```tsx
// Only add 'use client' if really necessary
'use client'

export default function InitiativeList() {
  const [data, setData] = useState([])
  // ...
}
```

### 'use client' only when necessary

Use `'use client'` only for:
- React Hooks (useState, useEffect, useContext, etc.)
- Interactive events (onClick, onChange, etc.)
- Libraries requiring the browser (Mapbox, etc.)
- Context Providers

### Server/Client Composition

✅ **DO**
```tsx
// Server Component
export default async function Page() {
  const data = await fetchData()
  
  return (
    <div>
      <ServerSideData data={data} />
      <ClientSideMap data={data} /> {/* Client Component */}
    </div>
  )
}
```

### Data Fetching

✅ **Prefer fetch with cache**
```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache 1h
  })
  return res.json()
}
```

### Server Actions

✅ **DO**
```tsx
'use server'

import { revalidatePath } from 'next/cache'

export async function createInitiative(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('initiatives').insert({
    name: formData.get('name'),
    // ...
  })
  
  if (error) throw error
  
  revalidatePath('/') // Revalidate cache
  return { success: true }
}
```

### Error Handling

✅ **DO**
```tsx
// error.tsx in app/
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>An error occurred</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Loading States

✅ **DO**
```tsx
// loading.tsx in app/
export default function Loading() {
  return <div>Loading...</div>
}
```

---

## TypeScript

### Strict configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Props typing

✅ **DO**
```tsx
interface InitiativeCardProps {
  initiative: Initiative
  onClick?: (id: string) => void
  className?: string
}

export default function InitiativeCard({ 
  initiative, 
  onClick,
  className 
}: InitiativeCardProps) {
  // ...
}
```

❌ **DON'T**
```tsx
export default function InitiativeCard(props: any) {
  // ...
}
```

### Types vs Interfaces

✅ **Interfaces for objects**
```tsx
interface Initiative {
  id: string
  name: string
}
```

✅ **Types for unions and primitives**
```tsx
type InitiativeType = 'Ressourcerie' | 'AMAP' | 'Autre'
type Status = 'loading' | 'success' | 'error'
```

### Avoid `any`

✅ **DO**
```tsx
function fetchData(): Promise<Initiative[]> {
  // ...
}
```

❌ **DON'T**
```tsx
function fetchData(): Promise<any> {
  // ...
}
```

### Utility Types

✅ **Use TypeScript utility types**
```tsx
// Make all fields optional
type PartialInitiative = Partial<Initiative>

// Select certain fields
type InitiativePreview = Pick<Initiative, 'id' | 'name' | 'type'>

// Omit certain fields
type InitiativeFormData = Omit<Initiative, 'id' | 'created_at'>

// Make certain fields required
type RequiredInitiative = Required<Pick<Initiative, 'name' | 'location'>>
```

### Type assertions

✅ **With validation**
```tsx
function parseJson(data: string): Initiative {
  const parsed = JSON.parse(data)
  if (!isInitiative(parsed)) {
    throw new Error('Invalid data')
  }
  return parsed
}
```

❌ **Without validation**
```tsx
const data = JSON.parse(str) as Initiative // Dangerous!
```

---

## Tailwind CSS

### Classes in logical order

✅ **DO**
```tsx
<div className="
  // Layout
  flex flex-col items-center justify-center
  // Spacing
  p-4 gap-2
  // Sizing
  w-full max-w-lg
  // Typography
  text-lg font-semibold
  // Colors
  bg-white text-gray-900
  // Border
  border border-gray-200 rounded-lg
  // Effects
  shadow-md hover:shadow-lg
  // Transitions
  transition-shadow duration-200
">
```

### Use @apply sparingly

✅ **DO** (for repeated patterns)
```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors;
  }
}
```

❌ **DON'T** (use classes directly)
```css
.card {
  @apply flex flex-col p-4; /* Prefer inline classes */
}
```

### Responsive Design (Mobile First)

✅ **DO**
```tsx
<div className="
  text-sm    // Mobile
  md:text-base  // Tablette
  lg:text-lg    // Desktop
">
```

### CSS variables for dynamic colors

✅ **DO**
```tsx
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          // ...
        }
      }
    }
  }
}
```

### Conditional classes with clsx/cn

✅ **DO**
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

---

## Testing with Jest

### Test structure

✅ **DO**
```tsx
describe('InitiativeCard', () => {
  // Setup commun
  const mockInitiative = { /* ... */ }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('displays initiative name', () => {
    render(<InitiativeCard initiative={mockInitiative} />)
    expect(screen.getByText(mockInitiative.name)).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<InitiativeCard initiative={mockInitiative} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### React Testing Library queries

✅ **Priority order**
1. `getByRole` - Accessible et sémantique
2. `getByLabelText` - Pour les formulaires
3. `getByPlaceholderText` - Pour les inputs
4. `getByText` - Pour le contenu
5. `getByTestId` - Last resort

```tsx
// ✅ Good
screen.getByRole('button', { name: /ajouter/i })

// ❌ Avoid
screen.getByTestId('add-button')
```

### Async tests

✅ **DO**
```tsx
it('loads data from API', async () => {
  render(<InitiativeList />)
  
  await waitFor(() => {
    expect(screen.getByText('Ressourcerie')).toBeInTheDocument()
  })
})
```

### Mocking

✅ **À FAIRE**
```tsx
// __mocks__/mapbox-gl.js
export default {
  Map: jest.fn(() => ({
    on: jest.fn(),
    remove: jest.fn(),
  })),
}
```

### Code coverage

Target minimum 80% coverage:
```bash
npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

---

## Accessibility (a11y)

### ARIA labels

✅ **DO**
```tsx
<button aria-label="Close panel">
  <X className="w-5 h-5" />
</button>
```

### Semantic landmarks

✅ **DO**
```tsx
<header>...</header>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<aside aria-label="Filters">...</aside>
<footer>...</footer>
```

### Color contrast

WCAG AA minimum:
- Normal text: 4.5:1 ratio
- Large text: 3:1 ratio

```tsx
// ✅ Good contrast
<p className="text-gray-900 bg-white">Text</p>

// ❌ Bad contrast
<p className="text-gray-300 bg-white">Text</p>
```

### Keyboard navigation

✅ **DO**
```tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Action
</button>
```

### Images

✅ **DO**
```tsx
<Image 
  src="/image.jpg" 
  alt="Detailed description of the image"
  width={500}
  height={300}
/>
```

❌ **DON'T**
```tsx
<img src="/image.jpg" alt="image" />
```

### Visible focus

```css
/* globals.css */
:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary-500;
}
```

---

## Performance

### Optimized images

✅ **DO**
```tsx
import Image from 'next/image'

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Lazy loading

✅ **DO**
```tsx
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
})
```

### Memoization

✅ **DO**
```tsx
'use client'

import { useMemo } from 'react'

export default function InitiativeList({ initiatives }: Props) {
  const filteredInitiatives = useMemo(
    () => initiatives.filter(i => i.verified),
    [initiatives]
  )
  
  return <div>{/* ... */}</div>
}
```

### Code splitting

✅ **DO**
```tsx
// Separate routes
app/
  initiatives/
    page.tsx
  map/
    page.tsx
```

### Bundle analyzer

```bash
npm install @next/bundle-analyzer

# next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({...})
```

---

## Security

### Input sanitization

✅ **DO**
```tsx
import DOMPurify from 'isomorphic-dompurify'

const cleanHtml = DOMPurify.sanitize(userInput)
```

### Environment variables

✅ **DO**
```bash
# .env.local (not versioned)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
DATABASE_URL=postgresql://... # Server-side only
```

❌ **DON'T**
```tsx
// Expose secrets on client side
const secret = process.env.DATABASE_URL // ❌ Danger!
```

### Content Security Policy

```tsx
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
  }
]
```

### Rate limiting (with Supabase)

```sql
-- Limit insertions per user
CREATE POLICY "rate_limit_insertions" ON initiatives
  FOR INSERT
  WITH CHECK (
    (SELECT COUNT(*) FROM initiatives 
     WHERE user_id = auth.uid() 
     AND created_at > NOW() - INTERVAL '1 hour') < 10
  );
```

---

## Git & Versioning

### Conventional Commits

✅ **DO**
```bash
git commit -m "feat: add FilterPanel component"
git commit -m "fix: correct PostGIS distance calculation"
git commit -m "docs: update README"
git commit -m "test: add tests for InitiativeCard"
git commit -m "refactor: simplify filtering logic"
git commit -m "chore: update dependencies"
```

### Branches

```bash
main          # Production
develop       # Development
feature/xxx   # New features
fix/xxx       # Bug fixes
hotfix/xxx    # Urgent fixes
```

### Pull Requests

PR template:

```markdown
## 📝 Description
[Describe changes]

## 🎯 Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## ✅ Checklist
- [ ] Tests added/pass
- [ ] Documentation updated
- [ ] Code linted
- [ ] No console.log
```

---

## 📚 Resources

- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last updated:** October 10, 2025

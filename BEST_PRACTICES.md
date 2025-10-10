# 📖 Guide des meilleures pratiques - LaMap

Ce document centralise toutes les meilleures pratiques de développement pour LaMap, basées sur les standards modernes du web en 2025.

## 📋 Table des matières

- [Next.js & React](#nextjs--react)
- [TypeScript](#typescript)
- [Tailwind CSS](#tailwind-css)
- [Testing avec Jest](#testing-avec-jest)
- [Accessibilité (a11y)](#accessibilité-a11y)
- [Performance](#performance)
- [Sécurité](#sécurité)
- [Git & Versioning](#git--versioning)

---

## Next.js & React

### Server Components par défaut

✅ **À FAIRE**
```tsx
// Par défaut, tous les composants sont Server Components
export default async function InitiativeList() {
  const supabase = await createClient()
  const { data: initiatives } = await supabase.from('initiatives').select()
  
  return <div>{/* ... */}</div>
}
```

❌ **À ÉVITER**
```tsx
// N'ajoutez 'use client' que si vraiment nécessaire
'use client'

export default function InitiativeList() {
  const [data, setData] = useState([])
  // ...
}
```

### 'use client' uniquement si nécessaire

Utilisez `'use client'` seulement pour :
- Hooks React (useState, useEffect, useContext, etc.)
- Événements interactifs (onClick, onChange, etc.)
- Bibliothèques nécessitant le navigateur (Mapbox, etc.)
- Context Providers

### Composition Server/Client

✅ **À FAIRE**
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

✅ **Préférer fetch avec cache**
```tsx
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache 1h
  })
  return res.json()
}
```

### Server Actions

✅ **À FAIRE**
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
  
  revalidatePath('/') // Revalider le cache
  return { success: true }
}
```

### Gestion des erreurs

✅ **À FAIRE**
```tsx
// error.tsx dans app/
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
      <h2>Une erreur est survenue</h2>
      <button onClick={() => reset()}>Réessayer</button>
    </div>
  )
}
```

### Loading States

✅ **À FAIRE**
```tsx
// loading.tsx dans app/
export default function Loading() {
  return <div>Chargement...</div>
}
```

---

## TypeScript

### Configuration stricte

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

### Typage des props

✅ **À FAIRE**
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

❌ **À ÉVITER**
```tsx
export default function InitiativeCard(props: any) {
  // ...
}
```

### Types vs Interfaces

✅ **Interfaces pour les objets**
```tsx
interface Initiative {
  id: string
  name: string
}
```

✅ **Types pour les unions et primitives**
```tsx
type InitiativeType = 'Ressourcerie' | 'AMAP' | 'Autre'
type Status = 'loading' | 'success' | 'error'
```

### Éviter `any`

✅ **À FAIRE**
```tsx
function fetchData(): Promise<Initiative[]> {
  // ...
}
```

❌ **À ÉVITER**
```tsx
function fetchData(): Promise<any> {
  // ...
}
```

### Utility Types

✅ **Utiliser les utility types TypeScript**
```tsx
// Rendre tous les champs optionnels
type PartialInitiative = Partial<Initiative>

// Sélectionner certains champs
type InitiativePreview = Pick<Initiative, 'id' | 'name' | 'type'>

// Omettre certains champs
type InitiativeFormData = Omit<Initiative, 'id' | 'created_at'>

// Rendre certains champs requis
type RequiredInitiative = Required<Pick<Initiative, 'name' | 'location'>>
```

### Assertions de type

✅ **Avec validation**
```tsx
function parseJson(data: string): Initiative {
  const parsed = JSON.parse(data)
  if (!isInitiative(parsed)) {
    throw new Error('Invalid data')
  }
  return parsed
}
```

❌ **Sans validation**
```tsx
const data = JSON.parse(str) as Initiative // Dangereux !
```

---

## Tailwind CSS

### Classes dans l'ordre logique

✅ **À FAIRE**
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

### Utiliser @apply avec parcimonie

✅ **À FAIRE** (pour les patterns répétés)
```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors;
  }
}
```

❌ **À ÉVITER** (utiliser directement les classes)
```css
.card {
  @apply flex flex-col p-4; /* Préférer les classes inline */
}
```

### Responsive Design (Mobile First)

✅ **À FAIRE**
```tsx
<div className="
  text-sm    // Mobile
  md:text-base  // Tablette
  lg:text-lg    // Desktop
">
```

### Variables CSS pour les couleurs dynamiques

✅ **À FAIRE**
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

### Classes conditionnelles avec clsx/cn

✅ **À FAIRE**
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

---

## Testing avec Jest

### Structure des tests

✅ **À FAIRE**
```tsx
describe('InitiativeCard', () => {
  // Setup commun
  const mockInitiative = { /* ... */ }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('affiche le nom de l\'initiative', () => {
    render(<InitiativeCard initiative={mockInitiative} />)
    expect(screen.getByText(mockInitiative.name)).toBeInTheDocument()
  })
  
  it('appelle onClick quand cliqué', () => {
    const handleClick = jest.fn()
    render(<InitiativeCard initiative={mockInitiative} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Queries React Testing Library

✅ **Ordre de priorité**
1. `getByRole` - Accessible et sémantique
2. `getByLabelText` - Pour les formulaires
3. `getByPlaceholderText` - Pour les inputs
4. `getByText` - Pour le contenu
5. `getByTestId` - En dernier recours

```tsx
// ✅ Bon
screen.getByRole('button', { name: /ajouter/i })

// ❌ À éviter
screen.getByTestId('add-button')
```

### Tests async

✅ **À FAIRE**
```tsx
it('charge les données depuis l\'API', async () => {
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

### Couverture de code

Viser minimum 80% de couverture :
```bash
npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

---

## Accessibilité (a11y)

### ARIA labels

✅ **À FAIRE**
```tsx
<button aria-label="Fermer le panneau">
  <X className="w-5 h-5" />
</button>
```

### Landmarks sémantiques

✅ **À FAIRE**
```tsx
<header>...</header>
<nav aria-label="Navigation principale">...</nav>
<main>...</main>
<aside aria-label="Filtres">...</aside>
<footer>...</footer>
```

### Contraste des couleurs

Minimum WCAG AA :
- Texte normal : ratio 4.5:1
- Texte large : ratio 3:1

```tsx
// ✅ Bon contraste
<p className="text-gray-900 bg-white">Texte</p>

// ❌ Mauvais contraste
<p className="text-gray-300 bg-white">Texte</p>
```

### Navigation au clavier

✅ **À FAIRE**
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

✅ **À FAIRE**
```tsx
<Image 
  src="/image.jpg" 
  alt="Description détaillée de l'image"
  width={500}
  height={300}
/>
```

❌ **À ÉVITER**
```tsx
<img src="/image.jpg" alt="image" />
```

### Focus visible

```css
/* globals.css */
:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary-500;
}
```

---

## Performance

### Images optimisées

✅ **À FAIRE**
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

✅ **À FAIRE**
```tsx
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <p>Chargement de la carte...</p>
})
```

### Memoization

✅ **À FAIRE**
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

✅ **À FAIRE**
```tsx
// Séparer les routes
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

## Sécurité

### Sanitization des inputs

✅ **À FAIRE**
```tsx
import DOMPurify from 'isomorphic-dompurify'

const cleanHtml = DOMPurify.sanitize(userInput)
```

### Variables d'environnement

✅ **À FAIRE**
```bash
# .env.local (non versionné)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
DATABASE_URL=postgresql://... # Côté serveur uniquement
```

❌ **À ÉVITER**
```tsx
// Exposer des secrets côté client
const secret = process.env.DATABASE_URL // ❌ Danger !
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

### Rate limiting (avec Supabase)

```sql
-- Limiter les insertions par utilisateur
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

✅ **À FAIRE**
```bash
git commit -m "feat: ajouter le composant FilterPanel"
git commit -m "fix: corriger le calcul de distance PostGIS"
git commit -m "docs: mettre à jour le README"
git commit -m "test: ajouter les tests pour InitiativeCard"
git commit -m "refactor: simplifier la logique de filtrage"
git commit -m "chore: mettre à jour les dépendances"
```

### Branches

```bash
main          # Production
develop       # Développement
feature/xxx   # Nouvelles fonctionnalités
fix/xxx       # Corrections de bugs
hotfix/xxx    # Corrections urgentes
```

### Pull Requests

Template de PR :

```markdown
## 📝 Description
[Décrire les changements]

## 🎯 Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## ✅ Checklist
- [ ] Tests ajoutés/passent
- [ ] Documentation mise à jour
- [ ] Code linted
- [ ] Pas de console.log
```

---

## 📚 Ressources

- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Dernière mise à jour :** 10 octobre 2025

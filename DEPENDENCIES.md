# 📦 Dépendances à installer pour LaMap

Ce fichier liste toutes les dépendances nécessaires au bon fonctionnement de LaMap.

## ✅ Dépendances déjà installées

Les dépendances suivantes sont déjà présentes dans `package.json` :

### Production
- ✅ `next` (15.x)
- ✅ `react` (19.x)
- ✅ `react-dom` (19.x)
- ✅ `@supabase/ssr`
- ✅ `@supabase/supabase-js`
- ✅ `mapbox-gl`

### Développement
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

## 📋 Dépendances manquantes à installer

### 1. Utilitaires CSS

```bash
npm install clsx tailwind-merge
```

**Utilisation :**
- `clsx` : Construction conditionnelle de classes CSS
- `tailwind-merge` : Fusion intelligente de classes Tailwind (évite les conflits)

**Où utilisé :**
- `src/lib/utils.ts` (fonction `cn()`)
- Tous les composants pour combiner les classes conditionnelles

---

### 2. Validation de formulaires (recommandé)

```bash
npm install zod react-hook-form @hookform/resolvers
```

**Utilisation :**
- `zod` : Validation de schémas TypeScript-first
- `react-hook-form` : Gestion performante de formulaires
- `@hookform/resolvers` : Intégration Zod avec React Hook Form

**Exemple d'utilisation future :**
```tsx
// src/schemas/initiative.ts
import { z } from 'zod'

export const initiativeSchema = z.object({
  name: z.string().min(3, 'Nom trop court'),
  type: z.enum(['Ressourcerie', 'AMAP', ...]),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
})
```

---

### 3. Icônes (recommandé)

```bash
npm install lucide-react
```

**Utilisation :**
- Bibliothèque d'icônes moderne, légère et tree-shakeable
- Compatible avec React et TypeScript

**Exemple d'utilisation :**
```tsx
import { MapPin, Plus, Filter, Search } from 'lucide-react'

<MapPin className="w-5 h-5 text-primary-500" />
```

---

### 4. Gestion de dates (si besoin)

```bash
npm install date-fns
```

**Utilisation :**
- Manipulation et formatage de dates (alternative à `utils.ts`)
- Plus complet que les fonctions custom

**Exemple :**
```tsx
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

format(new Date(), 'PPP', { locale: fr })
formatDistanceToNow(date, { locale: fr, addSuffix: true })
```

---

### 5. Toast notifications (recommandé)

```bash
npm install sonner
```

**Utilisation :**
- Notifications toast élégantes et accessibles
- API simple, compatible avec Next.js

**Exemple :**
```tsx
import { toast } from 'sonner'

toast.success('Initiative ajoutée avec succès !')
toast.error('Une erreur est survenue')
```

---

### 6. Sanitization HTML (sécurité)

```bash
npm install isomorphic-dompurify
```

**Utilisation :**
- Nettoyer les inputs utilisateur contenant du HTML
- Protection contre les attaques XSS

---

### 7. Analyse de bundle (développement)

```bash
npm install --save-dev @next/bundle-analyzer
```

**Configuration dans `next.config.ts` :**
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... config
})
```

**Utilisation :**
```bash
ANALYZE=true npm run build
```

---

### 8. Geocoding (API Adresse)

Pas de dépendance nécessaire, utiliser l'API gratuite du gouvernement français :

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

## 🚀 Installation complète recommandée

Pour installer toutes les dépendances recommandées en une seule commande :

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

## 📝 Installation minimale (essentiels uniquement)

Si vous voulez commencer avec le strict minimum :

```bash
npm install clsx tailwind-merge lucide-react
```

Ces trois packages sont essentiels pour :
- `clsx` + `tailwind-merge` : Utilisés dans `src/lib/utils.ts`
- `lucide-react` : Icônes utilisées dans les composants

---

## ⚙️ Dépendances optionnelles (à installer selon les besoins)

### Authentification sociale
```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### Graphiques et visualisations
```bash
npm install recharts
```

### Gestion d'état global (si nécessaire)
```bash
npm install zustand
# ou
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

## 🔍 Vérifier les versions installées

```bash
npm list --depth=0
```

---

## 🧹 Nettoyer les dépendances inutilisées

```bash
npm install -g depcheck
depcheck
```

---

## 📚 Documentation des packages

- [clsx](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [zod](https://zod.dev/)
- [react-hook-form](https://react-hook-form.com/)
- [lucide-react](https://lucide.dev/)
- [sonner](https://sonner.emilkowal.ski/)
- [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify)
- [date-fns](https://date-fns.org/)

---

**Dernière mise à jour :** 10 octobre 2025

# 🎨 Configuration shadcn/ui - LaMap

**Date :** 13 octobre 2025  
**Status :** ✅ Configuration terminée

---

## ✅ Ce qui a été fait

### 1. Installation des dépendances

```bash
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot @radix-ui/react-label
```

**Packages installés :**
- `tailwindcss-animate` : Animations pour shadcn/ui
- `class-variance-authority` : Gestion des variants de composants
- `clsx` : Utilitaire pour classes conditionnelles
- `tailwind-merge` : Fusion intelligente de classes Tailwind
- `lucide-react` : Icônes (déjà utilisé dans le projet)
- `@radix-ui/react-slot` : Composant Slot pour Button
- `@radix-ui/react-label` : Composant Label accessible

### 2. Configuration du projet

#### A) Fichier `components.json` créé

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

#### B) `tailwind.config.ts` mis à jour

- Ajout de `darkMode: 'class'`
- Ajout des variables CSS shadcn/ui (border, input, ring, etc.)
- Conservation de la palette LaMap (primary, secondary, accent)
- Intégration des deux systèmes de couleurs
- Ajout de `tailwindcss-animate` dans les plugins

#### C) `globals.css` mis à jour

- Ajout des variables CSS HSL pour les couleurs shadcn/ui
- Support du dark mode
- Variables compatibles avec les composants shadcn/ui

### 3. Composants shadcn/ui créés

| Composant | Fichier | Status |
|-----------|---------|--------|
| Button | `src/components/ui/button.tsx` | ✅ Créé |
| Card | `src/components/ui/card.tsx` | ✅ Créé |
| Input | `src/components/ui/input.tsx` | ✅ Créé |
| Label | `src/components/ui/label.tsx` | ✅ Créé |
| Badge | `src/components/ui/badge.tsx` | ✅ Créé |

### 4. Structure des dossiers

```
src/
├── components/
│   ├── ui/                    # ✅ Nouveau dossier shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── badge.tsx
│   ├── Initiative/
│   │   └── InitiativeCard.tsx # Existant (à migrer)
│   ├── Map/
│   │   └── Map.tsx
│   ├── AddInitiativeForm.tsx  # Existant (à migrer)
│   └── FilterPanel.tsx        # Existant (à migrer)
```

---

## 🎨 Système de design hybride

Le projet utilise maintenant un **système de design hybride** :

### Variables shadcn/ui (pour les composants UI)

```css
--background, --foreground
--card, --card-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
```

### Palette LaMap (conservée pour le branding)

```typescript
primary: {
  50-950: Nuances de vert (ESS)
}
secondary: {
  50-950: Nuances de bleu
}
accent: {
  50-950: Nuances d'orange
}
```

**Avantage :** Vous pouvez utiliser les deux !
- Composants shadcn/ui → Utilisent les variables HSL automatiquement
- Composants LaMap custom → Peuvent utiliser `bg-primary-500`, etc.

---

## 📝 Comment utiliser shadcn/ui dans vos composants

### Exemple 1 : Utiliser le Button

```tsx
import { Button } from '@/components/ui/button'

export default function MyComponent() {
  return (
    <div>
      <Button>Ajouter une initiative</Button>
      <Button variant="outline">Annuler</Button>
      <Button variant="ghost" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### Exemple 2 : Utiliser Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function InitiativeCard({ initiative }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{initiative.name}</CardTitle>
        <CardDescription>{initiative.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{initiative.description}</p>
      </CardContent>
      <CardFooter>
        <Button>Voir détails</Button>
      </CardFooter>
    </Card>
  )
}
```

### Exemple 3 : Formulaire avec Input et Label

```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MyForm() {
  return (
    <form>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom de l'initiative</Label>
          <Input id="name" placeholder="Ex: Ressourcerie de Belleville" />
        </div>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  )
}
```

### Exemple 4 : Badge

```tsx
import { Badge } from '@/components/ui/badge'

export default function InitiativeType({ type, verified }) {
  return (
    <div className="flex gap-2">
      <Badge variant="secondary">{type}</Badge>
      {verified && <Badge variant="default">Vérifié</Badge>}
    </div>
  )
}
```

---

## 🚀 Ajouter plus de composants shadcn/ui

Pour ajouter d'autres composants shadcn/ui (Dialog, Dropdown, etc.) :

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add toast
npx shadcn@latest add alert
```

Ou voir tous les composants disponibles :
https://ui.shadcn.com/docs/components

---

## 🔄 Migration des composants existants

### À faire (recommandé)

1. **AddInitiativeForm.tsx**
   - Remplacer les `<input>` par `<Input />` de shadcn/ui
   - Ajouter des `<Label />` pour l'accessibilité
   - Utiliser `<Button />` au lieu de `<button>`
   - Améliorer la validation visuelle

2. **FilterPanel.tsx**
   - Utiliser `<Card />` pour le conteneur
   - Utiliser `<Badge />` pour les compteurs
   - Utiliser `<Button />` pour les actions

3. **InitiativeCard.tsx**
   - Déjà très complet, peut utiliser `<Card />` comme base
   - Ajouter `<Badge />` pour les types
   - Utiliser `<Button />` pour les actions

### Exemple de migration : AddInitiativeForm

**Avant :**
```tsx
<input
  type="text"
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  placeholder="Nom..."
/>
```

**Après :**
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Nom de l'initiative</Label>
  <Input
    id="name"
    placeholder="Ex: Ressourcerie de Belleville"
  />
</div>
```

---

## 🎨 Personnalisation des couleurs

Pour adapter les couleurs shadcn/ui à la palette LaMap, modifiez dans `globals.css` :

```css
:root {
  --primary: 142.1 76.2% 36.3%;        /* Vert LaMap */
  --secondary: 210 40% 96.1%;          /* Bleu clair */
  --accent: 37.7 92.1% 50.2%;          /* Orange */
  /* ... */
}
```

Ces valeurs sont en format **HSL** (Hue, Saturation, Lightness).

---

## 🌙 Dark Mode

Le dark mode est configuré et prêt à l'emploi !

Pour l'activer, ajoutez `className="dark"` sur l'élément `<html>` :

```tsx
// src/app/layout.tsx
<html lang="fr" className="dark"> {/* Ou utiliser un toggle */}
```

Ou utilisez `next-themes` pour un toggle dynamique :

```bash
npm install next-themes
```

---

## ✅ Checklist post-configuration

- [x] shadcn/ui installé et configuré
- [x] Composants de base créés (Button, Card, Input, Label, Badge)
- [x] Tailwind config mise à jour avec les variables
- [x] globals.css mis à jour avec les couleurs HSL
- [x] Palette LaMap conservée et compatible
- [x] Dark mode configuré
- [ ] Migrer AddInitiativeForm vers shadcn/ui
- [ ] Migrer FilterPanel vers shadcn/ui
- [ ] Migrer InitiativeCard vers shadcn/ui (optionnel)
- [ ] Ajouter d'autres composants si nécessaire (Dialog, Toast, etc.)

---

## 📚 Ressources

- **shadcn/ui Docs** : https://ui.shadcn.com
- **Composants disponibles** : https://ui.shadcn.com/docs/components
- **Radix UI** (base de shadcn/ui) : https://www.radix-ui.com
- **Tailwind CSS** : https://tailwindcss.com
- **CVA (class-variance-authority)** : https://cva.style

---

**Dernière mise à jour :** 13 octobre 2025

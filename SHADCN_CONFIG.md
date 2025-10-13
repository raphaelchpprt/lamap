# 🎨 shadcn/ui Configuration - LaMap

**Date:** October 13, 2025  
**Status:** ✅ Configuration complete

---

## ✅ What Has Been Done

### 1. Dependencies Installation

```bash
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot @radix-ui/react-label
```

**Installed packages:**
- `tailwindcss-animate`: Animations for shadcn/ui
- `class-variance-authority`: Component variants management
- `clsx`: Utility for conditional classes
- `tailwind-merge`: Smart Tailwind class merging
- `lucide-react`: Icons (already used in the project)
- `@radix-ui/react-slot`: Slot component for Button
- `@radix-ui/react-label`: Accessible Label component

### 2. Project Configuration

#### A) `components.json` file created

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

#### B) `tailwind.config.ts` updated

- Added `darkMode: 'class'`
- Added shadcn/ui CSS variables (border, input, ring, etc.)
- Preserved LaMap palette (primary, secondary, accent)
- Integration of both color systems
- Added `tailwindcss-animate` to plugins

#### C) `globals.css` updated

- Added HSL CSS variables for shadcn/ui colors
- Dark mode support
- Variables compatible with shadcn/ui components

### 3. shadcn/ui Components Created

| Component | File | Status |
|-----------|------|--------|
| Button | `src/components/ui/button.tsx` | ✅ Created |
| Card | `src/components/ui/card.tsx` | ✅ Created |
| Input | `src/components/ui/input.tsx` | ✅ Created |
| Label | `src/components/ui/label.tsx` | ✅ Created |
| Badge | `src/components/ui/badge.tsx` | ✅ Created |

### 4. Folder Structure

```
src/
├── components/
│   ├── ui/                    # ✅ New shadcn/ui folder
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── badge.tsx
│   ├── Initiative/
│   │   └── InitiativeCard.tsx # Existing (to migrate)
│   ├── Map/
│   │   └── Map.tsx
│   ├── AddInitiativeForm.tsx  # Existing (to migrate)
│   └── FilterPanel.tsx        # Existing (to migrate)
```

---

## 🎨 Hybrid Design System

The project now uses a **hybrid design system**:

### shadcn/ui Variables (for UI components)

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

### LaMap Palette (preserved for branding)

```typescript
primary: {
  50-950: Green shades (SSE)
}
secondary: {
  50-950: Blue shades
}
accent: {
  50-950: Orange shades
}
```

**Advantage:** You can use both!
- shadcn/ui components → Use HSL variables automatically
- Custom LaMap components → Can use `bg-primary-500`, etc.

---

## 📝 How to Use shadcn/ui in Your Components

### Example 1: Using Button

```tsx
import { Button } from '@/components/ui/button'

export default function MyComponent() {
  return (
    <div>
      <Button>Add initiative</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### Example 2: Using Card

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
        <Button>View details</Button>
      </CardFooter>
    </Card>
  )
}
```

### Example 3: Form with Input and Label

```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function MyForm() {
  return (
    <form>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Initiative name</Label>
          <Input id="name" placeholder="e.g.: Ressourcerie de Belleville" />
        </div>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
```

### Example 4: Badge

```tsx
import { Badge } from '@/components/ui/badge'

export default function InitiativeType({ type, verified }) {
  return (
    <div className="flex gap-2">
      <Badge variant="secondary">{type}</Badge>
      {verified && <Badge variant="default">Verified</Badge>}
    </div>
  )
}
```

---

## 🚀 Add More shadcn/ui Components

To add other shadcn/ui components (Dialog, Dropdown, etc.):

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add toast
npx shadcn@latest add alert
```

Or see all available components:
https://ui.shadcn.com/docs/components

---

## 🔄 Migrating Existing Components

### To Do (recommended)

1. **AddInitiativeForm.tsx**
   - Replace `<input>` with `<Input />` from shadcn/ui
   - Add `<Label />` for accessibility
   - Use `<Button />` instead of `<button>`
   - Improve visual validation

2. **FilterPanel.tsx**
   - Use `<Card />` for the container
   - Use `<Badge />` for counters
   - Use `<Button />` for actions

3. **InitiativeCard.tsx**
   - Already very complete, can use `<Card />` as base
   - Add `<Badge />` for types
   - Use `<Button />` for actions

### Migration Example: AddInitiativeForm

**Before:**
```tsx
<input
  type="text"
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  placeholder="Nom..."
/>
```

**After:**
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Initiative name</Label>
  <Input
    id="name"
    placeholder="e.g.: Ressourcerie de Belleville"
  />
</div>
```

---

## 🎨 Color Customization

To adapt shadcn/ui colors to the LaMap palette, modify in `globals.css`:

```css
:root {
  --primary: 142.1 76.2% 36.3%;        /* LaMap Green */
  --secondary: 210 40% 96.1%;          /* Light Blue */
  --accent: 37.7 92.1% 50.2%;          /* Orange */
  /* ... */
}
```

These values are in **HSL** format (Hue, Saturation, Lightness).

---

## 🌙 Dark Mode

Dark mode is configured and ready to use!

To activate it, add `className="dark"` on the `<html>` element:

```tsx
// src/app/layout.tsx
<html lang="fr" className="dark"> {/* Or use a toggle */}
```

Or use `next-themes` for a dynamic toggle:

```bash
npm install next-themes
```

---

## ✅ Post-Configuration Checklist

- [x] shadcn/ui installed and configured
- [x] Base components created (Button, Card, Input, Label, Badge)
- [x] Tailwind config updated with variables
- [x] globals.css updated with HSL colors
- [x] LaMap palette preserved and compatible
- [x] Dark mode configured
- [ ] Migrate AddInitiativeForm to shadcn/ui
- [ ] Migrate FilterPanel to shadcn/ui
- [ ] Migrate InitiativeCard to shadcn/ui (optional)
- [ ] Add other components if needed (Dialog, Toast, etc.)

---

## 📚 Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Available Components**: https://ui.shadcn.com/docs/components
- **Radix UI** (shadcn/ui base): https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com
- **CVA (class-variance-authority)**: https://cva.style

---

**Last updated:** October 13, 2025

````

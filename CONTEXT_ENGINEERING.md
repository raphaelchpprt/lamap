# 📚 Context Engineering - LaMap

Ce document centralise toutes les décisions techniques, architecturales et fonctionnelles prises pendant le développement de LaMap. Il sert de référence pour maintenir la cohérence du projet et faciliter l'onboarding.

## 📅 Historique des sessions

### Session 1 - 10 octobre 2025 : Configuration initiale

**Objectifs de la session :**
- ✅ Configurer ESLint avec les meilleures pratiques
- ✅ Configurer Tailwind CSS avec palette personnalisée
- ✅ Configurer Jest avec mocks Mapbox
- ✅ Créer les types TypeScript complets
- ✅ Créer les composants React de base
- ✅ Créer les tests unitaires Jest

**Décisions techniques prises :**

1. **Stack technique confirmée :**
   - Next.js 15 (App Router)
   - React 19
   - TypeScript (strict mode)
   - Tailwind CSS avec plugins `@tailwindcss/forms` et `@tailwindcss/typography`
   - Jest + React Testing Library
   - Supabase (PostgreSQL + PostGIS + Auth)
   - Mapbox GL JS

2. **Architecture des dossiers :**
   ```
   src/
   ├── app/               # App Router Next.js
   ├── components/        # Composants React réutilisables
   ├── lib/              # Utilitaires et clients (Supabase, etc.)
   ├── types/            # Définitions TypeScript
   └── __tests__/        # Tests Jest
   ```

3. **Conventions de nommage :**
   - Composants : PascalCase (ex: `InitiativeCard.tsx`)
   - Fonctions : camelCase (ex: `fetchInitiatives()`)
   - Types/Interfaces : PascalCase (ex: `Initiative`, `InitiativeType`)
   - Fichiers utilitaires : kebab-case (ex: `format-date.ts`)

4. **Types d'initiatives définis :**
   - Ressourcerie
   - Repair Café
   - AMAP
   - Entreprise d'insertion
   - Point de collecte
   - Recyclerie
   - Épicerie sociale
   - Jardin partagé
   - Fab Lab
   - Coopérative
   - Monnaie locale
   - Tiers-lieu
   - Autre

5. **Palette de couleurs Tailwind :**
   ```typescript
   primary: {
     50: '#f0fdf4',
     100: '#dcfce7',
     200: '#bbf7d0',
     300: '#86efac',
     400: '#4ade80',
     500: '#10b981', // Vert principal ESS
     600: '#059669',
     700: '#047857',
     800: '#065f46',
     900: '#064e3b',
   }
   ```

6. **Configuration ESLint :**
   - Support TypeScript strict
   - Règles React Hooks
   - Règles d'accessibilité (jsx-a11y)
   - Import sorting automatique
   - Formatting avec Prettier intégré

7. **Configuration Jest :**
   - Environment : jsdom (pour tests React)
   - Mocks : Mapbox GL, Supabase, window.matchMedia
   - Setup global : `@testing-library/jest-dom`
   - Timeout : 10s pour tests async

**Composants créés :**

1. **`InitiativeCard.tsx`** (Client Component)
   - Affiche une carte d'initiative avec toutes les infos
   - Props : `initiative`, `onClick?`, `className?`
   - Gère l'affichage conditionnel des infos optionnelles
   - Badge "Vérifié" pour les initiatives vérifiées

2. **`AddInitiativeForm.tsx`** (Client Component)
   - Formulaire d'ajout d'initiative
   - Validation côté client
   - Intégration Supabase pour l'insertion
   - Gestion des erreurs utilisateur
   - Props : `onSuccess?`, `onCancel?`

3. **`FilterPanel.tsx`** (Client Component)
   - Panneau de filtrage par type d'initiative
   - Sélection/désélection multiple
   - Compteurs d'initiatives par type
   - Réductible/développable
   - Props : `selectedTypes`, `onFilterChange`, `initiativeCounts?`

4. **`Map.tsx`** (Client Component)
   - Carte Mapbox interactive
   - Affichage des markers pour chaque initiative
   - Clustering pour les performances
   - Props : `initiatives`, `onMarkerClick?`, `center?`, `zoom?`

**Tests créés :**

1. **`InitiativeCard.test.tsx`**
   - Test d'affichage des informations
   - Test des badges et statuts
   - Test des liens externes
   - Test de l'accessibilité
   - Test des props optionnelles

2. **`FilterPanel.test.tsx`**
   - Test de sélection/désélection
   - Test "Tout sélectionner/désélectionner"
   - Test des compteurs
   - Test du réductible
   - Test de l'accessibilité

**Configuration Supabase :**

1. **Client navigateur** (`lib/supabase/client.ts`)
   - Utilise `@supabase/ssr` avec `createBrowserClient`
   - Pour les Client Components

2. **Client serveur** (`lib/supabase/server.ts`)
   - Utilise `@supabase/ssr` avec `createServerClient`
   - Gestion des cookies Next.js
   - Pour les Server Components et Server Actions

3. **Types Supabase** (`lib/supabase/types.ts`)
   - Types générés automatiquement depuis la DB
   - Commande : `npx supabase gen types typescript --project-id <ID>`

**Schéma de base de données :**

```sql
-- Table initiatives avec PostGIS
CREATE TABLE initiatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  address TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  verified BOOLEAN DEFAULT false,
  image_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX initiatives_location_idx ON initiatives USING GIST(location);
CREATE INDEX initiatives_type_idx ON initiatives(type);

-- Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique" ON initiatives
  FOR SELECT USING (true);

CREATE POLICY "Création authentifiée" ON initiatives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modification propriétaire" ON initiatives
  FOR UPDATE USING (auth.uid() = user_id);
```

**Variables d'environnement nécessaires :**

```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Dépendances installées :**

```json
{
  "dependencies": {
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "mapbox-gl": "latest",
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/mapbox-gl": "latest",
    "jest": "latest",
    "jest-environment-jsdom": "latest",
    "tailwindcss": "latest",
    "@tailwindcss/forms": "latest",
    "@tailwindcss/typography": "latest"
  }
}
```

**À faire (TODO) :**

- [ ] Créer le composant `Map.tsx` avec Mapbox
- [ ] Implémenter le clustering des markers
- [ ] Créer les Server Actions pour l'API
- [ ] Implémenter l'authentification Supabase
- [ ] Ajouter le géocodage d'adresses (API Adresse BAN)
- [ ] Implémenter l'upload d'images (Supabase Storage)
- [ ] Créer le système de validation/modération
- [ ] Ajouter les tests d'intégration E2E
- [ ] Optimiser les performances (lazy loading, memoization)
- [ ] Ajouter l'internationalisation (i18n)

**Problèmes rencontrés et solutions :**

1. **Erreur TypeScript avec `toBeInTheDocument`**
   - Problème : Matchers Jest DOM non reconnus par TypeScript
   - Solution : Création du fichier `src/__tests__/jest.d.ts` avec les types

2. **Erreur avec `Record<InitiativeType, number>`**
   - Problème : Type trop strict pour les compteurs optionnels
   - Solution : Utilisation de `Partial<Record<InitiativeType, number>>`

**Références utiles :**

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Supabase Docs](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Jest Best Practices](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Prochaines étapes recommandées

1. **Implémenter le composant Map.tsx avec Mapbox**
   - Initialisation de la carte
   - Affichage des markers
   - Clustering
   - Gestion des popups

2. **Créer les Server Actions Supabase**
   - `fetchInitiatives(filters: InitiativeFilters)`
   - `createInitiative(data: InitiativeFormData)`
   - `updateInitiative(id: string, data: InitiativeUpdateData)`
   - `deleteInitiative(id: string)`

3. **Implémenter la page principale**
   - Layout avec carte et panneau latéral
   - Intégration des filtres
   - Gestion de l'état global

4. **Ajouter l'authentification**
   - Page de login/signup
   - Middleware de protection
   - Gestion des sessions

---

**Dernière mise à jour :** 10 octobre 2025

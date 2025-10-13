# 📚 Context Engineering - LaMap

This document centralizes all technical, architectural, and functional decisions made during LaMap development. It serves as a reference to maintain project consistency and facilitate onboarding.

## 📅 Session History

### Session 1 - October 10, 2025: Initial Setup

**Session objectives:**
- ✅ Configure ESLint with best practices
- ✅ Configure Tailwind CSS with custom palette
- ✅ Configure Jest with Mapbox mocks
- ✅ Create complete TypeScript types
- ✅ Create base React components
- ✅ Create Jest unit tests

**Technical decisions made:**

1. **Confirmed tech stack:**
   - Next.js 15 (App Router)
   - React 19
   - TypeScript (strict mode)
   - Tailwind CSS with `@tailwindcss/forms` and `@tailwindcss/typography` plugins
   - Jest + React Testing Library
   - Supabase (PostgreSQL + PostGIS + Auth)
   - Mapbox GL JS

2. **Folder architecture:**
   ```
   src/
   ├── app/               # Next.js App Router
   ├── components/        # Reusable React components
   ├── lib/              # Utilities and clients (Supabase, etc.)
   ├── types/            # TypeScript definitions
   └── __tests__/        # Jest tests
   ```

3. **Naming conventions:**
   - Components: PascalCase (e.g., `InitiativeCard.tsx`)
   - Functions: camelCase (e.g., `fetchInitiatives()`)
   - Types/Interfaces: PascalCase (e.g., `Initiative`, `InitiativeType`)
   - Utility files: kebab-case (e.g., `format-date.ts`)

4. **Defined initiative types:**
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

5. **Tailwind color palette:**
   ```typescript
   primary: {
     50: '#f0fdf4',
     100: '#dcfce7',
     200: '#bbf7d0',
     300: '#86efac',
     400: '#4ade80',
     500: '#10b981', // Main SSE green
     600: '#059669',
     700: '#047857',
     800: '#065f46',
     900: '#064e3b',
   }
   ```

6. **ESLint configuration:**
   - Strict TypeScript support
   - React Hooks rules
   - Accessibility rules (jsx-a11y)
   - Automatic import sorting
   - Integrated Prettier formatting

7. **Jest configuration:**
   - Environment: jsdom (for React tests)
   - Mocks: Mapbox GL, Supabase, window.matchMedia
   - Global setup: `@testing-library/jest-dom`
   - Timeout: 10s for async tests

**Components created:**

1. **`InitiativeCard.tsx`** (Client Component)
   - Displays an initiative card with all info
   - Props: `initiative`, `onClick?`, `className?`
   - Handles conditional display of optional info
   - "Verified" badge for verified initiatives

2. **`AddInitiativeForm.tsx`** (Client Component)
   - Initiative addition form
   - Client-side validation
   - Supabase integration for insertion
   - User error handling
   - Props: `onSuccess?`, `onCancel?`

3. **`FilterPanel.tsx`** (Client Component)
   - Filtering panel by initiative type
   - Multiple selection/deselection
   - Initiative counters by type
   - Collapsible/expandable
   - Props: `selectedTypes`, `onFilterChange`, `initiativeCounts?`

4. **`Map.tsx`** (Client Component)
   - Interactive Mapbox map
   - Marker display for each initiative
   - Clustering for performance
   - Props: `initiatives`, `onMarkerClick?`, `center?`, `zoom?`

**Tests created:**

1. **`InitiativeCard.test.tsx`**
   - Information display tests
   - Badge and status tests
   - External link tests
   - Accessibility tests
   - Optional props tests

2. **`FilterPanel.test.tsx`**
   - Selection/deselection tests
   - "Select all/Deselect all" tests
   - Counter tests
   - Collapsible tests
   - Accessibility tests

**Supabase configuration:**

1. **Browser client** (`lib/supabase/client.ts`)
   - Uses `@supabase/ssr` with `createBrowserClient`
   - For Client Components

2. **Server client** (`lib/supabase/server.ts`)
   - Uses `@supabase/ssr` with `createServerClient`
   - Next.js cookie management
   - For Server Components and Server Actions

3. **Supabase types** (`lib/supabase/types.ts`)
   - Types automatically generated from DB
   - Command: `npx supabase gen types typescript --project-id <ID>`

**Database schema:**

```sql
-- Initiatives table with PostGIS
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

-- Indexes for performance
CREATE INDEX initiatives_location_idx ON initiatives USING GIST(location);
CREATE INDEX initiatives_type_idx ON initiatives(type);

-- Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON initiatives
  FOR SELECT USING (true);

CREATE POLICY "Authenticated creation" ON initiatives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner modification" ON initiatives
  FOR UPDATE USING (auth.uid() = user_id);
```

**Required environment variables:**

```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Installed dependencies:**

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

**TODO:**

- [ ] Create `Map.tsx` component with Mapbox
- [ ] Implement marker clustering
- [ ] Create Server Actions for the API
- [ ] Implement Supabase authentication
- [ ] Add address geocoding (BAN Address API)
- [ ] Implement image upload (Supabase Storage)
- [ ] Create validation/moderation system
- [ ] Add E2E integration tests
- [ ] Optimize performance (lazy loading, memoization)
- [ ] Add internationalization (i18n)

**Problems encountered and solutions:**

1. **TypeScript error with `toBeInTheDocument`**
   - Problem: Jest DOM matchers not recognized by TypeScript
   - Solution: Created `src/__tests__/jest.d.ts` file with types

2. **Error with `Record<InitiativeType, number>`**
   - Problem: Type too strict for optional counters
   - Solution: Using `Partial<Record<InitiativeType, number>>`

**Useful references:**

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Supabase Docs](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Jest Best Practices](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Recommended next steps

1. **Implement Map.tsx component with Mapbox**
   - Map initialization
   - Marker display
   - Clustering
   - Popup management

2. **Create Supabase Server Actions**
   - `fetchInitiatives(filters: InitiativeFilters)`
   - `createInitiative(data: InitiativeFormData)`
   - `updateInitiative(id: string, data: InitiativeUpdateData)`
   - `deleteInitiative(id: string)`

3. **Implement main page**
   - Layout with map and side panel
   - Filter integration
   - Global state management

4. **Add authentication**
   - Login/signup page
   - Protection middleware
   - Session management

---

**Last updated:** October 10, 2025

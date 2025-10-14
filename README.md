# 🗺️ LaMap - Cartographie des initiatives sociales, environnementales et solidaires pour trouver où s'engager près de chez soi

> Plateforme web collaborative de cartographie des initiatives d'économie circulaire, sociale et solidaire (ESS) et associatives en France.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000)](https://ui.shadcn.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostGIS-3ECF8E)](https://supabase.com/)

## 🎯 Objectifs du projet

LaMap permet aux utilisateurs de :
- 📍 Découvrir des initiatives ESS et associatives locales sur une carte interactive
- ➕ Ajouter de nouvelles initiatives
- 🔍 Filtrer par type (ressourceries, AMAP, repair cafés, etc.)
- 🌍 Rechercher dans un rayon géographique
- 💬 Partager et commenter des initiatives

## 🛠️ Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15+ (App Router) | Framework React SSR/SSG |
| **React** | 19+ | Bibliothèque UI |
| **TypeScript** | 5+ | Typage statique |
| **Tailwind CSS** | 3+ | Styling utility-first |
| **shadcn/ui** | Latest | Bibliothèque de composants (Radix UI) |
| **Jest** | Latest | Tests unitaires |
| **React Testing Library** | Latest | Tests composants |
| **Mapbox GL JS** | Latest | Cartographie WebGL |
| **Supabase** | Latest (@supabase/ssr) | Backend (PostgreSQL + PostGIS + Auth) |
| **PostGIS** | Via Supabase | Requêtes géospatiales |

## 📦 Installation

### Prérequis

- Node.js 18+ (recommandé : 20+)
- npm, yarn, pnpm ou bun
- Un compte [Supabase](https://supabase.com) (gratuit)
- Un token [Mapbox](https://www.mapbox.com) (gratuit jusqu'à 50k requêtes/mois)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/lamap.git
cd lamap
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```bash
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...votre_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...votre_key
```

### 4. Configurer Supabase

#### a) Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anonyme (dans Settings > API)

#### b) Créer la base de données

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table des initiatives
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

-- Index spatial pour performance
CREATE INDEX initiatives_location_idx ON initiatives USING GIST(location);
CREATE INDEX initiatives_type_idx ON initiatives(type);

-- Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Lecture publique" ON initiatives
  FOR SELECT USING (true);

CREATE POLICY "Création authentifiée" ON initiatives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Modification propriétaire" ON initiatives
  FOR UPDATE USING (auth.uid() = user_id);
```

#### c) Générer les types TypeScript (optionnel)

```bash
npx supabase gen types typescript --project-id <votre-project-id> > src/lib/supabase/types.ts
```

### 5. Lancer le projet en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🧪 Tests

### Lancer tous les tests

```bash
npm test
```

### Lancer les tests en mode watch

```bash
npm test -- --watch
```

### Lancer les tests avec couverture

```bash
npm test -- --coverage
```

## 📁 Structure du projet

```
lamap/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Page d'accueil (carte)
│   │   ├── globals.css        # Styles globaux
│   │   └── actions.ts         # Server Actions
│   ├── components/            # Composants React
│   │   ├── Initiative/
│   │   │   └── InitiativeCard.tsx
│   │   ├── Map/
│   │   │   └── Map.tsx        # Carte Mapbox
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── AddInitiativeForm.tsx
│   │   ├── FilterPanel.tsx
│   │   └── MapView.tsx        # Vue principale
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Client Supabase navigateur
│   │   │   ├── server.ts      # Client Supabase Server Components
│   │   │   └── types.ts       # Types générés de la DB
│   │   └── utils.ts           # Utilitaires (cn, etc.)
│   ├── types/
│   │   └── initiative.ts      # Types TypeScript métier
│   └── __tests__/             # Tests Jest
│       ├── components/        # Tests unitaires
│       ├── integration/       # Tests d'intégration
│       └── lib/               # Tests des utilitaires
├── docs/                      # 📚 Documentation projet
│   ├── QUICKSTART.md
│   ├── CONTEXT_ENGINEERING_GUIDELINES.md
│   ├── LEARNING_CONTEXT.md
│   ├── MAP_TROUBLESHOOTING.md
│   ├── BEST_PRACTICES.md
│   ├── STATUS.md
│   └── ...
├── public/                    # Assets statiques
├── scripts/                   # Scripts utilitaires
│   └── check-map.sh          # Vérification configuration
├── __mocks__/                 # Mocks Jest (Mapbox, Supabase)
├── .github/                   # Configuration GitHub
│   └── copilot-instructions.md
├── .env.local                 # Variables d'environnement (non versionné)
├── jest.config.js
├── jest.setup.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json            # Configuration shadcn/ui
└── package.json
```

## 🎨 Conventions de code

### TypeScript
- **Strict mode** activé
- Toujours typer les props, fonctions et retours
- Utiliser les interfaces pour les objets
- Utiliser les types unions pour les énumérations

### Composants React
- **Server Components** par défaut
- Ajouter `'use client'` uniquement si nécessaire (interactivité)
- Props typées avec des interfaces
- Nommage : PascalCase

### Styling
- Tailwind CSS utility-first
- Palette personnalisée LaMap (vert ESS)
- Classes responsive : mobile-first

### Tests
- Un fichier de test par composant
- Nommage : `ComponentName.test.tsx`
- Tester : rendu, interactions, accessibilité
- Utiliser `@testing-library/react`

## 🚀 Déploiement

### Vercel (recommandé)

```bash
npm run build
vercel deploy
```

### Autres plateformes

Le projet Next.js peut être déployé sur :
- Netlify
- AWS Amplify
- Railway
- Fly.io
- Docker (avec `next/standalone`)

Voir la [documentation Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

## 📚 Documentation

### Documentation du projet

- **[📖 Guide de démarrage rapide](./docs/QUICKSTART.md)** - Installation et premiers pas
- **[🏗️ Architecture & Décisions](./docs/CONTEXT_ENGINEERING_GUIDELINES.md)** - Guidelines de développement
- **[🎓 Contexte d'apprentissage](./docs/LEARNING_CONTEXT.md)** - Approche pédagogique
- **[🗺️ Dépannage de la carte](./docs/MAP_TROUBLESHOOTING.md)** - Résolution des problèmes Mapbox
- **[🧩 Configuration shadcn/ui](./docs/SHADCN_CONFIG.md)** - Composants installés
- **[📦 Dépendances](./docs/DEPENDENCIES.md)** - Liste des packages utilisés
- **[✅ Bonnes pratiques](./docs/BEST_PRACTICES.md)** - Conventions de code
- **[📊 État du projet](./docs/STATUS.md)** - Fonctionnalités et roadmap
- **[📝 Résumés des sessions](./docs/SESSION_SUMMARY.md)** - Historique du développement

### Ressources externes

- [Next.js Docs](https://nextjs.org/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Supabase Docs](https://supabase.com/docs)
- [PostGIS](https://postgis.net/documentation/)
- [shadcn/ui](https://ui.shadcn.com/)

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines
- Respecter les conventions de code
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Suivre le [Conventional Commits](https://www.conventionalcommits.org/)

## 👤 Auteur

**Raphael** - Projet de formation Next.js + TypeScript + Cartographie

---

**Status du projet :** 🚧 En développement actif

**Dernière mise à jour :** 10 octobre 2025

# 🚀 Guide de démarrage rapide - LaMap

Guide pas à pas pour lancer LaMap en 10 minutes.

## ⚡ Setup Express (développeur expérimenté)

```bash
# 1. Installer les dépendances essentielles
npm install clsx tailwind-merge lucide-react

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Mapbox et Supabase

# 3. Configurer la base de données Supabase
# Exécuter le SQL dans supabase.com/dashboard

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 📝 Setup Détaillé (débutant)

### Étape 1 : Vérifier les prérequis

```bash
# Vérifier Node.js (minimum 18, recommandé 20+)
node --version

# Vérifier npm
npm --version
```

Si Node.js n'est pas installé : [nodejs.org](https://nodejs.org)

---

### Étape 2 : Cloner et installer

```bash
# Cloner le projet
git clone https://github.com/votre-username/lamap.git
cd lamap

# Installer toutes les dépendances
npm install

# Installer les dépendances essentielles manquantes
npm install clsx tailwind-merge lucide-react
```

---

### Étape 3 : Obtenir les clés API

#### A) Mapbox (gratuit jusqu'à 50k requêtes/mois)

1. Créer un compte sur [mapbox.com](https://www.mapbox.com)
2. Aller dans [Account > Tokens](https://account.mapbox.com/access-tokens/)
3. Copier votre **Default Public Token** (commence par `pk.`)

#### B) Supabase (gratuit)

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Cliquer sur "New Project"
3. Remplir :
   - **Name** : `lamap`
   - **Database Password** : Générer un mot de passe fort
   - **Region** : Choisir la plus proche (ex: `eu-west-1` pour Europe)
4. Attendre 2-3 minutes que le projet se crée
5. Une fois créé, aller dans **Settings > API**
6. Noter :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public** key : `eyJhbGciOi...`

---

### Étape 4 : Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```bash
# Copier le template
cp .env.example .env.local

# Ou créer manuellement :
touch .env.local
```

Éditer `.env.local` et remplacer par vos vraies clés :

```bash
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4In0.xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxx
```

⚠️ **Important** : Ne jamais committer `.env.local` sur Git !

---

### Étape 5 : Configurer la base de données Supabase

1. Ouvrir le dashboard Supabase : [app.supabase.com](https://app.supabase.com)
2. Sélectionner votre projet `lamap`
3. Aller dans **SQL Editor** (icône de base de données à gauche)
4. Cliquer sur **+ New Query**
5. Copier-coller ce SQL :

```sql
-- Activer l'extension PostGIS pour la géolocalisation
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

-- Index spatial pour améliorer les performances des requêtes géographiques
CREATE INDEX initiatives_location_idx ON initiatives USING GIST(location);

-- Index sur le type pour les filtres
CREATE INDEX initiatives_type_idx ON initiatives(type);

-- Activer Row Level Security
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les initiatives
CREATE POLICY "Lecture publique des initiatives" ON initiatives
  FOR SELECT USING (true);

-- Politique : Seuls les utilisateurs authentifiés peuvent créer
CREATE POLICY "Création pour utilisateurs authentifiés" ON initiatives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : Seul le créateur peut modifier son initiative
CREATE POLICY "Modification par le propriétaire uniquement" ON initiatives
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : Seul le créateur peut supprimer son initiative
CREATE POLICY "Suppression par le propriétaire uniquement" ON initiatives
  FOR DELETE USING (auth.uid() = user_id);
```

6. Cliquer sur **Run** (ou Cmd/Ctrl + Enter)
7. Vérifier que le message "Success. No rows returned" apparaît

---

### Étape 6 : Ajouter des données de test (optionnel)

Dans le même **SQL Editor**, exécuter :

```sql
-- Insérer quelques initiatives de test
INSERT INTO initiatives (name, type, description, address, location) VALUES
(
  'Ressourcerie de Belleville',
  'Ressourcerie',
  'Collecte, tri et vente d''objets de seconde main',
  '12 rue de Belleville, 75020 Paris',
  ST_SetSRID(ST_MakePoint(2.3894, 48.8724), 4326)
),
(
  'AMAP des Batignolles',
  'AMAP',
  'Panier de légumes bio hebdomadaire',
  '8 rue Cardinet, 75017 Paris',
  ST_SetSRID(ST_MakePoint(2.3122, 48.8842), 4326)
),
(
  'Repair Café Lyon',
  'Repair Café',
  'Ateliers de réparation collaboratifs tous les samedis',
  '15 rue de la République, 69002 Lyon',
  ST_SetSRID(ST_MakePoint(4.8357, 45.7640), 4326)
);
```

---

### Étape 7 : Lancer le projet

```bash
# Démarrer le serveur de développement
npm run dev
```

Vous devriez voir :

```
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

### Étape 8 : Vérifier que tout fonctionne

✅ **Checklist** :
- [ ] La page d'accueil se charge sans erreur
- [ ] La carte Mapbox s'affiche correctement
- [ ] Les initiatives de test apparaissent sur la carte (si vous les avez ajoutées)
- [ ] Les filtres fonctionnent
- [ ] Pas d'erreur dans la console du navigateur (F12)

---

## 🐛 Dépannage

### Erreur : "Module not found: Can't resolve 'clsx'"

```bash
npm install clsx tailwind-merge
```

### Erreur : "Invalid Mapbox token"

1. Vérifier que votre token commence bien par `pk.`
2. Vérifier qu'il n'y a pas d'espace avant/après dans `.env.local`
3. Redémarrer le serveur après modification de `.env.local`

```bash
# Arrêter le serveur : Ctrl + C
npm run dev
```

### Erreur : "fetch failed" ou erreur Supabase

1. Vérifier que l'URL Supabase est correcte (doit se terminer par `.supabase.co`)
2. Vérifier que la clé `anon` est bien copiée entièrement
3. Vérifier que le SQL a bien été exécuté (table `initiatives` existe)

Pour vérifier la table dans Supabase :
- Aller dans **Table Editor** > chercher `initiatives`

### La carte ne s'affiche pas

1. Ouvrir la console du navigateur (F12)
2. Vérifier s'il y a des erreurs Mapbox
3. Vérifier que le token Mapbox est bien configuré
4. Essayer de recharger la page (Cmd/Ctrl + R)

### Port 3000 déjà utilisé

```bash
# Lancer sur un autre port
npm run dev -- -p 3001
```

---

## 🧪 Lancer les tests

```bash
# Tests unitaires
npm test

# Tests en mode watch (pour le développement)
npm test -- --watch

# Tests avec couverture
npm test -- --coverage
```

---

## 📦 Build de production

```bash
# Créer un build optimisé
npm run build

# Lancer le build en production localement
npm start
```

---

## 🔄 Prochaines étapes

1. **Lire la documentation complète** : `README.md`
2. **Consulter les best practices** : `BEST_PRACTICES.md`
3. **Comprendre l'architecture** : `CONTEXT_ENGINEERING.md`
4. **Installer les dépendances optionnelles** : `DEPENDENCIES.md`

---

## 🆘 Besoin d'aide ?

- **Documentation Next.js** : [nextjs.org/docs](https://nextjs.org/docs)
- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Documentation Mapbox** : [docs.mapbox.com](https://docs.mapbox.com/mapbox-gl-js/api/)
- **GitHub Issues** : [github.com/votre-username/lamap/issues](https://github.com)

---

## ✅ Checklist complète

- [ ] Node.js 18+ installé
- [ ] Projet cloné
- [ ] Dépendances installées (`npm install`)
- [ ] Dépendances essentielles ajoutées (`clsx`, `tailwind-merge`, `lucide-react`)
- [ ] Compte Mapbox créé
- [ ] Token Mapbox obtenu
- [ ] Compte Supabase créé
- [ ] Projet Supabase configuré
- [ ] SQL exécuté dans Supabase
- [ ] Fichier `.env.local` créé et rempli
- [ ] Serveur lancé (`npm run dev`)
- [ ] Page accessible sur http://localhost:3000
- [ ] Carte Mapbox visible
- [ ] Aucune erreur dans la console

**Temps estimé** : 10-15 minutes

---

**Dernière mise à jour :** 10 octobre 2025

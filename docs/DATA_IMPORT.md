# 📥 Guide d'import de données

Ce guide explique comment importer des initiatives depuis différentes sources de données ouvertes.

## 🗺️ Sources disponibles

### 1. OpenStreetMap (OSM)
**Script:** `import-from-osm.ts`  
**Avantages:**
- ✅ Gratuit et open source
- ✅ Données géolocalisées précises
- ✅ Couverture mondiale
- ✅ Mise à jour communautaire

**Types d'initiatives importables:**
- Ressourceries (`shop=second_hand`)
- Points de collecte (`amenity=recycling`)
- AMAP/Magasins bio (`shop=organic`)
- Entreprises d'insertion (`amenity=social_facility`)
- Repair Cafés (`amenity=community_centre`)

### 2. Data.gouv.fr (À venir)
**Script:** `import-from-datagouv.ts`  
Base de données officielle du gouvernement français.

---

## 🚀 Prérequis

### 1. Variables d'environnement

Ajoutez dans `.env.local` :

```bash
# Supabase (déjà présent)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role Key (IMPORTANT: ne jamais exposer côté client!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...votre_service_role_key
```

⚠️ **ATTENTION:** La `SUPABASE_SERVICE_ROLE_KEY` donne un accès admin total. Ne JAMAIS la commiter ou l'exposer côté client !

### 2. Trouver la Service Role Key

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Settings → API
4. Copiez la clé dans la section "**service_role** secret"

### 3. Installer les dépendances

```bash
npm install --save-dev tsx
```

---

## 📖 Utilisation

### Import depuis OpenStreetMap

#### Importer un type spécifique

```bash
# Importer toutes les ressourceries
npm run import:osm second_hand

# Importer tous les points de collecte
npm run import:osm recycling

# Importer les magasins bio (AMAP-like)
npm run import:osm organic_shop

# Importer les entreprises d'insertion
npm run import:osm social_facility

# Importer les Repair Cafés
npm run import:osm repair_cafe
```

#### Importer tous les types

```bash
npm run import:osm all
```

#### Options

**Ignorer les doublons:**

```bash
npm run import:osm all --skip-duplicates
```

Cette option vérifie si une initiative existe déjà dans un rayon de 50 mètres avant d'importer.

---

## 🔍 Exemple de sortie

```
🗺️  Importing Ressourcerie from OpenStreetMap...
📍 Bounding box: France (41.0,-5.5,51.5,10.0)
──────────────────────────────────────────────────
🔍 Querying Overpass API...
Query: node["shop"="second_hand"]
📦 Found 347 nodes
📝 289 have names
🔍 Checking for duplicates...
📊 12 duplicates filtered out
📥 Inserting 277 initiatives...
✅ Successfully inserted 277 initiatives
──────────────────────────────────────────────────
✅ Import complete!
```

---

## 🛠️ Développement

### Ajouter une nouvelle source

1. Créer un nouveau script dans `scripts/`
2. Implémenter la fonction `fetchData()` pour récupérer les données
3. Mapper les données vers le format `Initiative`
4. Utiliser `insertInitiatives()` pour insérer en base

### Structure d'une initiative

```typescript
interface Initiative {
  name: string;                    // Nom (requis)
  type: InitiativeType;            // Type (requis)
  description?: string;            // Description
  address?: string;                // Adresse complète
  location: string;                // PostGIS: "POINT(lon lat)"
  verified: boolean;               // false pour import auto
  website?: string;                // URL du site web
  phone?: string;                  // Téléphone
  email?: string;                  // Email
  opening_hours?: object;          // Horaires (JSON)
  user_id?: string;                // null pour imports
}
```

### Format PostGIS

⚠️ **IMPORTANT:** Les coordonnées sont dans l'ordre `POINT(longitude latitude)` (pas lat/lon).

```typescript
// ✅ Correct
location: "POINT(2.3522 48.8566)"  // Paris

// ❌ Incorrect
location: "POINT(48.8566 2.3522)"
```

---

## 🔧 Dépannage

### Erreur : "Missing Supabase credentials"

→ Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est dans `.env.local`

### Erreur : "Overpass API timeout"

→ L'API Overpass peut être lente. Options :
1. Importer un seul type à la fois
2. Réessayer plus tard
3. Utiliser une instance Overpass privée

### Erreur : "duplicate key value violates unique constraint"

→ Des initiatives existent déjà. Utilisez `--skip-duplicates`

### Erreur : "Function get_nearby_initiatives does not exist"

→ La fonction SQL n'est pas créée. Exécutez le SQL de setup :

```sql
CREATE OR REPLACE FUNCTION get_nearby_initiatives(
  lat FLOAT,
  lng FLOAT,
  radius_km FLOAT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  location GEOGRAPHY,
  verified BOOLEAN,
  distance_km FLOAT
) AS $$
  SELECT
    id,
    name,
    type,
    description,
    address,
    location,
    verified,
    ST_Distance(
      location::geography,
      ST_MakePoint(lng, lat)::geography
    ) / 1000 AS distance_km
  FROM initiatives
  WHERE ST_DWithin(
    location::geography,
    ST_MakePoint(lng, lat)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km;
$$ LANGUAGE sql STABLE;
```

---

## 📊 Statistiques après import

Pour voir le nombre d'initiatives par type :

```sql
SELECT type, COUNT(*) as count
FROM initiatives
GROUP BY type
ORDER BY count DESC;
```

Pour voir les initiatives récemment importées :

```sql
SELECT name, type, address, created_at
FROM initiatives
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔗 Ressources

- [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [OSM Tags pour ESS](https://wiki.openstreetmap.org/wiki/Key:social_facility)
- [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis)
- [Data.gouv.fr API](https://doc.data.gouv.fr/api/reference/)

---

## ⚠️ Avertissements

1. **Rate Limiting:** L'API Overpass a des limites. Attendez 1-2 secondes entre les requêtes.
2. **Qualité des données:** Les données OSM sont contributives, toujours vérifier la qualité.
3. **Licence:** Données OSM sous licence ODbL, attribution requise.
4. **RGPD:** Ne pas importer de données personnelles sans consentement.


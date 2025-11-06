# 🛠️ Scripts LaMap

Collection de scripts utilitaires pour le projet LaMap.

## 📥 Import de données

### `npm run seed` - Seed des données de test 🌱

Insère des initiatives de test couvrant tous les types d'initiatives.

**Données insérées:**
- 25+ initiatives réelles à Paris
- Tous les 20 types d'initiatives couverts
- Adresses et coordonnées GPS réelles
- Mix d'initiatives vérifiées et non vérifiées

**Usage:**
```bash
npm run seed
```

**Prérequis:**
- Variables d'environnement dans `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ pas l'anon key!)

**Note:** Le script ajoute des initiatives sans supprimer les existantes.

---

### `npm run seed:bulk` - Seed MASSIF (100 initiatives par type) 🚀

**⚠️ ATTENTION:** Génère et insère **2000 initiatives** (100 par type) !

**Données générées:**
- **2000 initiatives** au total
- **100 par type** (20 types × 100)
- Noms et adresses variés et réalistes
- Répartition sur les 20 arrondissements de Paris
- Coordonnées GPS randomisées
- Mix de statuts vérifiés/non vérifiés
- Contact aléatoire (phone/email/website)

**Usage:**
```bash
npm run seed:bulk
```

**Durée:** ~5-10 minutes (dépend de la connexion)

**Prérequis:**
- Variables d'environnement dans `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Note:** Parfait pour tester les performances avec beaucoup de données !

---

### `import-from-osm.ts`

Importe des initiatives depuis OpenStreetMap.

**Usage:**
```bash
npm run import:osm [tag] [options]
```

**Exemples:**
```bash
# Voir l'aide
npm run import:osm

# Importer les ressourceries
npm run import:osm second_hand

# Importer tout
npm run import:osm all --skip-duplicates
```

**📚 Documentation complète:** Voir [docs/DATA_IMPORT.md](../docs/DATA_IMPORT.md)

---

### `import-from-datagouv.ts` (À venir)

Importe depuis Data.gouv.fr

---

## 🔧 Autres scripts

### `check-map.sh`

Vérifie la configuration de la carte Mapbox.

```bash
./scripts/check-map.sh
```

---

## 📝 Notes pour les développeurs

### Créer un nouveau script

1. Créer le fichier `.ts` dans `scripts/`
2. Ajouter la commande dans `package.json` → `scripts`
3. Documenter dans ce README
4. Ajouter des tests si nécessaire

### Variables d'environnement

Les scripts utilisent les mêmes variables que l'app Next.js depuis `.env.local`.

Pour les opérations admin (imports), utiliser `SUPABASE_SERVICE_ROLE_KEY`.


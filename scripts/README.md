# 🛠️ Scripts LaMap

Collection de scripts utilitaires pour le projet LaMap.

## 📥 Import de données

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


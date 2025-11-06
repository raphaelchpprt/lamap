# 🔧 Mise à Jour Réseaux Sociaux - Guide Complet

**Date:** 6 novembre 2025  
**Objectif:** Ajouter les réseaux sociaux aux initiatives et corriger le tooltip

---

## ✅ Ce qui a été fait

### 1. Correction du Tooltip (TypeBadge)

**Problème:** Le tooltip s'affichait par défaut au lieu de seulement au hover.

**Solution:**
- Déplacé `TooltipProvider` à l'extérieur du div principal
- Ajouté `defaultOpen={false}` au composant Tooltip
- Le tooltip apparaît maintenant UNIQUEMENT au survol de l'icône ℹ️
- Délai de 300ms avant l'affichage (UX)

**Fichiers modifiés:**
- `src/components/Initiative/InitiativeCard.tsx`

### 2. Tooltip dans la Popup de la Carte

**Problème:** Pas de tooltip dans la popup qui apparaît sur la carte.

**Solution:**
- Ajout d'une icône ℹ️ à côté du badge de type dans la popup
- Tooltip en HTML pur avec affichage au survol
- Style cohérent avec le reste de l'app

**Fichiers modifiés:**
- `src/components/Map/Map.tsx`
- Import de `INITIATIVE_DESCRIPTIONS` pour les descriptions

### 3. Réseaux Sociaux dans la Base de Données

**Problème:** Les colonnes social_media existent mais ne sont pas retournées par les fonctions SQL.

**Solution:**
- Mise à jour de `get_initiatives_in_bounds.sql` pour inclure les 6 colonnes
- Mise à jour de `get_initiatives_text_location.sql` pour inclure les 6 colonnes
- Les données sont maintenant récupérées automatiquement

**Colonnes ajoutées:**
- `facebook` (TEXT)
- `instagram` (TEXT)
- `twitter` (TEXT)
- `linkedin` (TEXT)
- `youtube` (TEXT)
- `tiktok` (TEXT)

---

## 🚀 Étapes à Suivre

### Étape 1: Mettre à Jour Supabase (OBLIGATOIRE)

Les colonnes existent déjà, mais les fonctions SQL doivent être mises à jour.

#### Option A: Via le SQL Editor (Recommandé)

1. **Ouvrir Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT/sql
   ```

2. **Exécuter les 2 fichiers SQL** (dans l'ordre):

   **a) Mettre à jour get_initiatives_in_bounds:**
   ```bash
   # Copier le contenu de:
   supabase/functions/get_initiatives_in_bounds.sql
   # Et l'exécuter dans le SQL Editor
   ```

   **b) Mettre à jour get_initiatives_text_location:**
   ```bash
   # Copier le contenu de:
   supabase/functions/get_initiatives_text_location.sql
   # Et l'exécuter dans le SQL Editor
   ```

3. **Vérifier que ça fonctionne:**
   ```sql
   SELECT id, name, facebook, instagram, twitter, linkedin
   FROM get_initiatives_in_bounds(-5.5, 41.0, 10.0, 51.5, NULL, false, 10);
   ```
   
   ✅ Si vous voyez les colonnes `facebook`, `instagram`, etc., c'est bon !

#### Option B: Utiliser le Script Helper

```bash
./scripts/update-social-media.sh
```

Ce script affiche le contenu des fichiers SQL à copier-coller.

### Étape 2: Redémarrer le Serveur de Développement

```bash
# Arrêter le serveur (Ctrl+C)

# Redémarrer
npm run dev
```

### Étape 3: Vider le Cache du Navigateur

**Chrome/Edge:**
- `Cmd + Shift + R` (Mac)
- `Ctrl + Shift + R` (Windows/Linux)

**Ou ouvrir en navigation privée:**
- `Cmd + Shift + N` (Mac)
- `Ctrl + Shift + N` (Windows/Linux)

### Étape 4: Tester les Fonctionnalités

#### Test 1: Tooltip au Hover
1. Ouvrir une carte d'initiative
2. Survoler l'icône ℹ️ à côté du type
3. ✅ Le tooltip doit apparaître après 300ms
4. ✅ Le tooltip ne doit PAS être visible par défaut

#### Test 2: Tooltip dans la Popup
1. Survoler un marqueur sur la carte
2. Une popup apparaît
3. Survoler l'icône ℹ️ dans le badge
4. ✅ Un tooltip doit apparaître avec la description du type

#### Test 3: Réseaux Sociaux
1. Ouvrir la carte détaillée d'une initiative
2. Scroller vers le bas
3. ✅ Si l'initiative a des réseaux sociaux, vous devez voir une section "Réseaux sociaux"
4. ✅ Les boutons doivent avoir les couleurs des plateformes (bleu Facebook, dégradé Instagram, etc.)

---

## 📊 Importer des Données de Réseaux Sociaux (Optionnel)

Un script de web scraping existe pour récupérer les liens depuis les sites web des initiatives.

### Test en mode Dry-Run (sans modification)

```bash
npm run import:social -- --dry-run
```

Cela va :
- Scanner les sites web des initiatives qui en ont un
- Extraire les liens de réseaux sociaux trouvés
- Afficher ce qui serait importé (SANS modifier la base)

### Import Réel

```bash
npm run import:social
```

⚠️ **Attention:** Cela va modifier la base de données !

**Résultats attendus:**
- Trouve ~4-5 liens par site en moyenne
- Traite par lot de 100 initiatives
- Affiche les statistiques en temps réel

---

## 🐛 Dépannage

### Problème: Le tooltip s'affiche toujours par défaut

**Solution:**
```bash
# 1. Vider le cache du navigateur
# 2. Redémarrer le serveur
npm run dev
# 3. Ouvrir en navigation privée
```

### Problème: Pas de réseaux sociaux visibles

**Vérifications:**

1. **Les fonctions SQL sont-elles à jour ?**
   ```sql
   -- Dans Supabase SQL Editor:
   SELECT * FROM get_initiatives_in_bounds(-5.5, 41.0, 10.0, 51.5, NULL, false, 1);
   ```
   Vous devez voir les colonnes `facebook`, `instagram`, etc.

2. **Les initiatives ont-elles des données ?**
   ```sql
   SELECT id, name, facebook, instagram, twitter, linkedin
   FROM initiatives
   WHERE facebook IS NOT NULL
      OR instagram IS NOT NULL
      OR twitter IS NOT NULL
      OR linkedin IS NOT NULL
   LIMIT 10;
   ```
   
   Si aucun résultat → Les initiatives n'ont pas encore de réseaux sociaux.
   → Lancer `npm run import:social` pour importer.

3. **La conversion TypeScript fonctionne-t-elle ?**
   Ouvrir la console navigateur (F12) et vérifier qu'il n'y a pas d'erreurs.

### Problème: Erreur "INITIATIVE_DESCRIPTIONS is not defined"

**Solution:**
Le fichier `src/types/initiative.ts` doit exporter `INITIATIVE_DESCRIPTIONS`.

Vérifier que cette ligne existe:
```typescript
export const INITIATIVE_DESCRIPTIONS: Record<InitiativeType, string> = {
  // ...
};
```

---

## 📁 Fichiers Modifiés

```
src/
  components/
    Initiative/
      InitiativeCard.tsx          ← Tooltip fix + social media display
    Map/
      Map.tsx                      ← Tooltip in popup + import INITIATIVE_DESCRIPTIONS
  types/
    initiative.ts                  ← Export INITIATIVE_DESCRIPTIONS

supabase/
  functions/
    get_initiatives_in_bounds.sql ← Add social media columns
    get_initiatives_text_location.sql ← Add social media columns

scripts/
  import-social-media.ts          ← Web scraping script
  update-social-media.sh          ← Helper script (new)

docs/
  SOCIAL_MEDIA_UPDATE.md         ← This file
```

---

## ✅ Checklist de Validation

- [ ] Les fonctions SQL sont mises à jour dans Supabase
- [ ] Le serveur de développement est redémarré
- [ ] Le cache du navigateur est vidé
- [ ] Le tooltip apparaît UNIQUEMENT au hover de l'icône ℹ️
- [ ] Le tooltip fonctionne dans la popup de la carte
- [ ] Les réseaux sociaux s'affichent dans la carte détaillée
- [ ] Les boutons ont les bonnes couleurs (Facebook bleu, Instagram dégradé, etc.)
- [ ] (Optionnel) Les données de réseaux sociaux sont importées

---

## 🎯 Résultat Attendu

### Avant
- ❌ Tooltip visible par défaut (gênant)
- ❌ Pas de tooltip dans la popup
- ❌ Pas de réseaux sociaux visibles

### Après
- ✅ Tooltip au hover uniquement (300ms delay)
- ✅ Tooltip dans popup de carte au hover
- ✅ Section réseaux sociaux avec boutons colorés
- ✅ Import automatique depuis les sites web

---

## 📞 Support

Si un problème persiste après avoir suivi ce guide:

1. Vérifier les erreurs dans la console du navigateur (F12)
2. Vérifier les erreurs dans le terminal du serveur
3. Vérifier que les fonctions SQL sont bien mises à jour dans Supabase
4. Essayer en navigation privée pour éliminer les problèmes de cache

**Commit associé:** `6f8809b - fix: tooltip hover-only behavior and add social media to SQL functions`

---

**Bon développement ! 🚀**

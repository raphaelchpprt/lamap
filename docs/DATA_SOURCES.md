# Sources de Données Réelles pour LaMap

**Date:** 6 novembre 2025  
**État:** Document de référence pour l'import de données ESS

---

## 📊 État Actuel de la Base

- **Total:** 11,993 initiatives
- **Répartition:**
  - Point de collecte: 408 (3.4%)
  - AMAP: 120 (1.0%)
  - Atelier vélo: 102 (0.9%)
  - Jardin partagé: 102 (0.9%)
  - Composteur collectif: 101 (0.8%)
  - Grainothèque: 101 (0.8%)
  - Friperie: 58 (0.5%)
  - Autres types: <15 initiatives chacun

**⚠️ Problème identifié:** La majorité des données sont **synthétiques** (générées par seed-bulk-initiatives.ts). Seules ~2700 initiatives proviennent d'OpenStreetMap (vraies données).

---

## ✅ Sources Implémentées et Fonctionnelles

### 1. **OpenStreetMap (OSM)** 🗺️

**Script:** `scripts/import-from-osm.ts`  
**Commande:** `npm run import:osm <tag>`

**Résultats:**
- ✅ `second_hand`: **2688 friperies/ressourceries** (excellent !)
- ✅ `organic_shop`: **9 AMAP/magasins bio**
- ❌ `recycling`: 0 résultat
- ❌ `repair_cafe`: 0 résultat
- ❌ `social_facility`: 0 résultat

**Points forts:**
- Données communautaires vérifiées
- Coordonnées GPS précises
- Noms réels des commerces
- Mise à jour régulière par la communauté

**Limites:**
- Couverture variable selon les catégories
- Dépend de l'engagement des contributeurs OSM
- Certaines catégories ESS mal représentées

**Recommandation:** ⭐⭐⭐⭐⭐ Excellente source pour friperies/ressourceries

---

## 🔧 Sources à Explorer

### 2. **Repair Café International** 🔧

**API officielle:** `https://repaircafe.org/api/v1/locations`  
**Script:** `scripts/import-real-data.ts repair-cafe`

**État:** ❌ API retourne 404 (pas accessible publiquement)

**Alternatives:**
1. **Carte interactive officielle:** https://repaircafe.org/fr/visiter/
   - Scraping manuel ou automatisé
   - Contacter l'organisation pour accès API

2. **Réseau Repair Café France:**
   - Contact: info@repaircafe.org
   - Demande de partenariat pour accès données

3. **OpenStreetMap:**
   - Contribuer en ajoutant les Repair Cafés manquants
   - Tag: `amenity=repair` + `repair=*`

**Estimation:** ~200-300 Repair Cafés en France

---

### 3. **Data.gouv.fr** 🇫🇷

**Plateforme:** https://www.data.gouv.fr/  
**Script:** À créer

**Datasets potentiels:**

#### **AMAP (Association pour le Maintien d'une Agriculture Paysanne)**
- **Source:** MIRAMAP (réseau national)
- **URL:** https://miramap.org/-Carte-des-AMAP-.html
- **Format:** Scraping ou contact direct
- **Estimation:** ~2000 AMAP en France

#### **Entreprises d'insertion**
- **Source:** CNEI (Comité National des Entreprises d'Insertion)
- **URL:** https://cnei.org/
- **Format:** Annuaire à extraire
- **Estimation:** ~1000 entreprises

#### **Jardins partagés**
- **Source:** Réseau National des Jardins Partagés
- **URL:** https://jardins-partages.org/
- **Format:** Carte à scraper
- **Estimation:** ~500-1000 jardins

#### **Composteurs collectifs**
- **Source:** Données municipales + associations
- **URL:** Varies par ville
- **Format:** Agrégation manuelle
- **Estimation:** ~1000+ composteurs

**Action requise:**
1. Explorer les datasets disponibles sur data.gouv.fr
2. Contacter les organismes pour accès API/CSV
3. Créer parsers spécifiques par type de données

**Recommandation:** ⭐⭐⭐⭐ Données officielles fiables

---

### 4. **SINOE (ADEME)** ♻️

**Organisme:** ADEME (Agence de la transition écologique)  
**Plateforme:** https://www.sinoe.org/

**Données disponibles:**
- Déchèteries (toutes en France)
- Ressourceries et recycleries
- Points de collecte des déchets
- Composteurs collectifs
- Statistiques de gestion des déchets

**Accès:**
- 🔒 Base de données protégée
- Requiert un compte professionnel
- Possibilité de partenariat avec ADEME

**Processus:**
1. Créer un compte sur sinoe.org
2. Demander accès aux données (justification projet)
3. Export CSV ou API si disponible

**Estimation:** ~5000+ points de collecte/déchèteries

**Recommandation:** ⭐⭐⭐⭐⭐ Source officielle exhaustive pour déchets

---

### 5. **Réseau Cocagne** 🌱

**Organisation:** Réseau national des jardins d'insertion  
**Site:** https://www.reseaucocagne.asso.fr/

**Données:**
- Jardins d'insertion (production bio + réinsertion)
- AMAP partenaires
- Points de vente directe

**Accès:**
- Carte interactive sur le site
- Contact direct nécessaire pour export données
- Partenariat possible

**Estimation:** ~100-150 jardins en France

**Recommandation:** ⭐⭐⭐ Niche mais données qualitatives

---

### 6. **Zero Waste France** 🌍

**Organisation:** Réseau national anti-gaspillage  
**Site:** https://www.zerowastefrance.org/

**Données potentielles:**
- Groupes locaux Zero Waste
- Initiatives zéro déchet
- Commerces vrac
- Cartographie collaborative

**Accès:**
- Contact réseau national
- Contribution communautaire possible

**Estimation:** ~50-100 groupes locaux

**Recommandation:** ⭐⭐⭐ Données communautaires engagées

---

### 7. **Réemploi (Réseau des Ressourceries)** ♻️

**Organisation:** Réseau national des Ressourceries  
**Site:** https://www.ressourceries.info/

**Données:**
- Annuaire des ressourceries labellisées
- Recycleries adhérentes
- Critères qualité respectés

**Accès:**
- Annuaire public sur site web
- Possible scraping ou export CSV
- Contact pour partenariat

**Estimation:** ~150-200 structures labellisées

**Recommandation:** ⭐⭐⭐⭐ Ressourceries certifiées

---

### 8. **L'Heureux Cyclage** 🚴

**Organisation:** Réseau des ateliers vélo solidaires  
**Site:** https://www.heureux-cyclage.org/

**Données:**
- Ateliers vélo participatifs
- Vélo-écoles
- Recycleries vélo

**Accès:**
- Carte des ateliers sur le site
- Scraping ou export
- Contact réseau

**Estimation:** ~300-400 ateliers en France

**Recommandation:** ⭐⭐⭐⭐ Excellente couverture vélo

---

### 9. **Donnons.org / Geev** 📦

**Type:** Plateformes de don

**Limitations:**
- Données privées (utilisateurs)
- Pas d'accès API public
- Focus sur particuliers, pas structures

**Action:** Ne pas poursuivre (incompatible)

---

### 10. **Annuaire National des Structures de l'ESS** 🤝

**Source:** ESS France  
**Site:** https://www.ess-france.org/

**Données:**
- Structures de l'ESS (toutes catégories)
- Coopératives
- Associations
- Mutuelles
- Entreprises d'insertion

**Accès:**
- Annuaire public partiel
- Contact ESS France pour données complètes

**Recommandation:** ⭐⭐⭐⭐ Large couverture ESS

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : Immédiate (1-2 semaines)

1. **Nettoyer la base actuelle**
   ```bash
   # Supprimer les données synthétiques
   DELETE FROM initiatives WHERE name LIKE '%#%';
   ```

2. **Scraper les sources web simples**
   - Réseau des Ressourceries (annuaire public)
   - L'Heureux Cyclage (carte des ateliers)
   - Repair Café (carte interactive)

3. **Compléter OSM**
   - Explorer plus de tags OSM (`amenity=recycling`, `shop=charity`, etc.)
   - Contribuer en ajoutant structures manquantes

### Phase 2 : Court terme (1 mois)

4. **Demandes de partenariat officielles**
   - SINOE/ADEME (accès base déchèteries)
   - MIRAMAP (annuaire AMAP complet)
   - Réseau Cocagne (jardins d'insertion)
   - CNEI (entreprises d'insertion)

5. **Développer parsers Data.gouv.fr**
   - Explorer datasets ESS disponibles
   - Automatiser imports

### Phase 3 : Moyen terme (2-3 mois)

6. **Crowdsourcing LaMap**
   - Permettre aux utilisateurs d'ajouter initiatives
   - Système de vérification communautaire
   - Gamification (badges, contributions)

7. **Partenariats stratégiques**
   - Zero Waste France
   - France Nature Environnement
   - Collectivités locales

---

## 💻 Scripts Disponibles

### Import OpenStreetMap
```bash
npm run import:osm second_hand      # Friperies/ressourceries ✅
npm run import:osm organic_shop     # AMAP/bio ✅
npm run import:osm recycling        # Points de recyclage ❌
npm run import:osm repair_cafe      # Repair Cafés ❌
npm run import:osm social_facility  # Structures sociales ❌
```

### Import Multi-Sources
```bash
npm run import:real repair-cafe     # Repair Cafés (API 404)
npm run import:real all             # Toutes sources
```

### Analyse
```bash
npm run analyze                     # Statistiques base de données
```

### Seed (à éviter en prod)
```bash
npm run seed                        # 25 initiatives test
npm run seed:bulk                   # 2000 initiatives synthétiques ⚠️
```

---

## 📚 Ressources Complémentaires

- **OpenStreetMap Wiki ESS:** https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drecycling
- **Data.gouv.fr Guide API:** https://guides.data.gouv.fr/publier-des-donnees/guide-data.gouv.fr/api
- **ADEME Open Data:** https://data.ademe.fr/
- **ESS France:** https://www.ess-france.org/

---

## ✅ Check-list Qualité des Données

Pour chaque initiative importée, vérifier :

- [ ] **Nom** : Non vide, pas de format "Structure #123"
- [ ] **Type** : Correspond à InitiativeType
- [ ] **Coordonnées** : Dans bounds France (41-51.5°N, -5.5-10°E)
- [ ] **Adresse** : Réelle (pas "123 rue Fake")
- [ ] **Contact** : Au moins 1 moyen (site/email/tel)
- [ ] **Source** : Traçabilité (OSM, SINOE, etc.)
- [ ] **Date** : created_at/updated_at cohérents

---

## 📞 Contacts Utiles

- **ADEME SINOE:** sinoe@ademe.fr
- **Réseau des Ressourceries:** contact@ressourceries.info
- **L'Heureux Cyclage:** contact@heureux-cyclage.org
- **MIRAMAP:** contact@miramap.org
- **Repair Café International:** info@repaircafe.org
- **Zero Waste France:** contact@zerowastefrance.org
- **ESS France:** contact@ess-france.org

---

**Dernière mise à jour:** 2025-11-06  
**Prochaine révision:** Après premiers imports de partenaires

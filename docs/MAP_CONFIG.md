# 🗺️ Configuration de la carte - France uniquement

## Objectif

Limiter l'affichage de la carte à la France métropolitaine pour une meilleure expérience utilisateur.

## Configuration

### Limites géographiques (bounds)

```typescript
// src/components/Map/Map.tsx

const FRANCE_BOUNDS: [number, number, number, number] = [
  -5.5, // Ouest (Brest - Pointe de Corsen)
  41.0, // Sud (Corse - Bonifacio)
  10.0, // Est (Alsace - Lauterbourg)
  51.5, // Nord (Nord - Bray-Dunes)
];
```

**Format:** `[ouest, sud, est, nord]` (longitude, latitude)

### Application dans Mapbox

```typescript
map.current = new mapboxgl.Map({
  // ... autres options
  maxBounds: FRANCE_BOUNDS, // Limite la navigation
  minZoom: 5, // Empêche de dézoomer trop loin
});
```

## Comportement

✅ **Ce qui fonctionne :**
- L'utilisateur peut naviguer librement **à l'intérieur** de la France
- Impossible de faire défiler la carte en dehors des limites
- Le zoom minimum est de 5 (évite de voir toute l'Europe)
- Le zoom maximum reste à 18 (vue détaillée des rues)

❌ **Ce qui est bloqué :**
- Impossible de naviguer vers d'autres pays
- Impossible de dézoomer pour voir toute l'Europe
- Les limites "rebondissent" quand on essaie de sortir

## Coordonnées de référence

| Point | Longitude | Latitude | Lieu |
|-------|-----------|----------|------|
| **Ouest** | -5.5° | - | Brest (Pointe de Corsen) |
| **Est** | 10.0° | - | Lauterbourg (Alsace) |
| **Sud** | - | 41.0° | Bonifacio (Corse) |
| **Nord** | - | 51.5° | Bray-Dunes (Nord) |
| **Centre** | 2.3522° | 46.6034° | Centre géométrique |

## Zoom optimal

```typescript
zoom: 6,      // Vue initiale (toute la France visible)
minZoom: 5,   // Vue minimale (France + frontières)
maxZoom: 18,  // Vue maximale (niveau rue)
```

## DOM (Départements et Territoires d'Outre-Mer)

⚠️ **Note :** Les territoires d'outre-mer (Guadeloupe, Martinique, Réunion, etc.) ne sont **pas inclus** dans ces limites car ils sont géographiquement éloignés.

### Solution future pour les DOM-TOM

Si besoin d'inclure les DOM-TOM :

1. **Option 1 :** Boutons de navigation rapide
   ```typescript
   const DOM_TOM_CENTERS = {
     guadeloupe: [-61.551, 16.265],
     martinique: [-61.024, 14.641],
     guyane: [-53.125, 3.933],
     reunion: [55.536, -21.115],
     mayotte: [45.166, -12.827],
   };
   ```

2. **Option 2 :** Désactiver `maxBounds` temporairement
   ```typescript
   map.current.setMaxBounds(null); // Libère les limites
   map.current.flyTo({ center: DOM_TOM_CENTERS.reunion });
   ```

3. **Option 3 :** Carte secondaire pour les DOM-TOM

## Tester les limites

### Dans le navigateur

1. Ouvrir http://localhost:3001
2. Essayer de déplacer la carte vers :
   - ❌ L'Espagne (ouest/sud)
   - ❌ L'Allemagne (est)
   - ❌ La Belgique (nord)
   - ❌ L'Italie (sud-est)
3. La carte devrait "rebondir" et rester en France

### Dans le code

```typescript
// Vérifier si un point est dans les bounds
const isInFrance = (lng: number, lat: number): boolean => {
  const [west, south, east, north] = FRANCE_BOUNDS;
  return lng >= west && lng <= east && lat >= south && lat <= north;
};

console.log(isInFrance(2.3522, 48.8566)); // Paris: true
console.log(isInFrance(-0.563, 44.837));  // Bordeaux: true
console.log(isInFrance(14.26, 40.85));    // Naples: false
```

## Ressources

- [Mapbox maxBounds](https://docs.mapbox.com/mapbox-gl-js/api/map/#map-parameters)
- [Coordonnées de la France](https://fr.wikipedia.org/wiki/Points_extr%C3%AAmes_de_la_France)
- [LngLatBoundsLike](https://docs.mapbox.com/mapbox-gl-js/api/geography/#lnglatboundslike)

---

**Dernière mise à jour :** 13 octobre 2025

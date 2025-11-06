'use client';

/**
 * Main Map Component for LaMap
 *
 * Uses Mapbox GL JS to display an interactive map with ESS initiatives.
 * Supports clustering, filters, and marker interaction.
 */

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import {
  databaseInitiativeToInitiative,
  type DatabaseInitiativeWithTextLocation,
} from '@/lib/supabase/types';
import {
  TYPE_GRADIENTS_CSS,
  INITIATIVE_DESCRIPTIONS,
} from '@/types/initiative';

import type { Initiative, InitiativeFilters } from '@/types/initiative';

// ================================
// CONFIGURATION
// ================================

const DEFAULT_CONFIG = {
  style: 'mapbox://styles/mapbox/light-v11',
  center: [2.3522, 46.6034] as [number, number], // Center of France
  zoom: 5.5,
  minZoom: 4.5, // Can't zoom out to see other countries
  maxZoom: 18,
} as const;

// Geographic bounds for metropolitan France
// Format: [west, south, east, north] (LngLatBoundsLike)
const FRANCE_BOUNDS: [number, number, number, number] = [
  -5.5, // West (Brest)
  41.0, // South (Corsica)
  10.0, // East (Strasbourg)
  51.5, // North (Dunkerque)
];

// ================================
// TYPES
// ================================

interface MapProps {
  /** Custom CSS classes */
  className?: string;

  /** Applied filters for initiatives */
  filters?: InitiativeFilters;

  /** Callback when clicking on an initiative */
  onInitiativeClick?: (initiative: Initiative) => void;

  /** Callback when clicking on the map */
  onMapClick?: (coordinates: [number, number]) => void;

  /** Callback when initiatives are loaded */
  onInitiativesLoaded?: (initiatives: Initiative[]) => void;

  /** Enable/disable clustering */
  enableClustering?: boolean;

  /** Auto-fit map to initiatives */
  autoFit?: boolean;

  /** Initiatives to display (if not provided, loaded from Supabase) */
  initiatives?: Initiative[];
}

// ================================
// MAIN COMPONENT
// ================================

export default function Map({
  className = 'h-full w-full',
  filters,
  onInitiativeClick,
  onMapClick,
  onInitiativesLoaded,
  enableClustering = true,
  autoFit = false,
  initiatives: externalInitiatives,
}: MapProps) {
  // ================================
  // STATE & REFS
  // ================================

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastBoundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const lastFiltersRef = useRef<InitiativeFilters | undefined>(filters);
  const setupMapLayersRef = useRef<(() => void) | null>(null);

  // ================================
  // MAP INITIALIZATION
  // ================================

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check for Mapbox token
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError('Missing Mapbox token. Check your .env.local file');
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: DEFAULT_CONFIG.style,
        center: DEFAULT_CONFIG.center,
        zoom: DEFAULT_CONFIG.zoom,
        minZoom: DEFAULT_CONFIG.minZoom,
        maxZoom: DEFAULT_CONFIG.maxZoom,
        maxBounds: FRANCE_BOUNDS, // Limite la navigation à la France
        antialias: true,
        // Disable Mapbox telemetry to avoid CORS warnings in development
        trackResize: true,
        collectResourceTiming: false,
      });

      map.current.on('load', () => {
        setIsLoaded(true);
        if (map.current) {
          // Force reset zoom to default
          map.current.setZoom(DEFAULT_CONFIG.zoom);
          map.current.setCenter(DEFAULT_CONFIG.center);
          // addFranceMask(); // Removed: no longer graying out other countries
          setupMapSources();
          setupMapLayers();
          setupMapInteractions();
        }
      });

      // Navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Geolocation
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      // Fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Unable to initialize Mapbox map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsLoaded(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // LOADING INITIATIVES (Viewport-based)
  // ================================

  /**
   * Load initiatives within the current map bounds
   * Uses PostGIS function get_initiatives_in_bounds for performance
   */
  const loadInitiativesInViewport = useCallback(async () => {
    // Use external initiatives if provided
    if (externalInitiatives) {
      setInitiatives(externalInitiatives);
      return;
    }

    // Wait for map to be ready
    if (!map.current || !isLoaded) {
      return;
    }

    // Clear any pending load timeout (debounce)
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Check if bounds changed significantly (avoid reload on tiny movements)
    // BUT always reload if filters changed
    const filtersChanged =
      JSON.stringify(lastFiltersRef.current?.types) !==
        JSON.stringify(filters?.types) ||
      lastFiltersRef.current?.verified_only !== filters?.verified_only;

    const currentBounds = map.current.getBounds();
    if (lastBoundsRef.current && currentBounds && !filtersChanged) {
      const lastCenter = lastBoundsRef.current.getCenter();
      const currentCenter = currentBounds.getCenter();
      const distance = lastCenter.distanceTo(currentCenter);

      // Only reload if moved more than 1km or zoomed
      const lastZoom = map.current.getZoom();
      const zoomChanged =
        lastBoundsRef.current &&
        Math.abs(lastZoom - map.current.getZoom()) > 0.5;

      if (distance < 1000 && !zoomChanged) {
        return;
      }
    }

    // Update last filters
    lastFiltersRef.current = filters;

    // Debounce: wait 500ms before loading
    loadTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Safety check
        if (!map.current) return;

        const bounds = map.current.getBounds();
        if (!bounds) return; // Safety check for bounds

        const zoom = map.current.getZoom();

        // Get bounds coordinates
        const west = bounds.getWest();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const north = bounds.getNorth();

        // Adaptive limit based on zoom level - SHOW EVERYTHING in viewport
        // Low zoom (< 9): load ALL for heatmap (max 50000)
        // Medium zoom (9-14): load for clustering (max 30000)
        // High zoom (> 14): load for individual markers (max 10000)
        let limit = 10000;
        if (zoom < 9) {
          limit = 50000;
        } else if (zoom < 14) {
          limit = 30000;
        }

        // Call PostGIS function with viewport bounds
        const { data, error: dbError } = (await supabase.rpc(
          'get_initiatives_in_bounds' as never,
          {
            p_west: west,
            p_south: south,
            p_east: east,
            p_north: north,
            p_types: filters?.types?.length ? filters.types : null,
            p_verified_only: filters?.verified_only || false,
            p_limit: limit,
          } as never
        )) as {
          data: DatabaseInitiativeWithTextLocation[] | null;
          error: { message: string } | null;
        };

        if (dbError) {
          throw new Error(`Erreur Supabase: ${dbError.message}`);
        }

        const formattedInitiatives = (
          (data as DatabaseInitiativeWithTextLocation[]) || []
        ).map(databaseInitiativeToInitiative);

        setInitiatives(formattedInitiatives);

        // Notify parent component of loaded initiatives
        onInitiativesLoaded?.(formattedInitiatives);

        // Store current bounds for next comparison
        if (map.current) {
          lastBoundsRef.current = map.current.getBounds();
        }
      } catch (err) {
        console.error('Erreur lors du chargement des initiatives:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  }, [filters, externalInitiatives, isLoaded, onInitiativesLoaded]);

  // Load on mount and when filters change
  useEffect(() => {
    loadInitiativesInViewport();
  }, [loadInitiativesInViewport]);

  // Reload when map moves or zooms (viewport-based loading)
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const handleMoveEnd = () => {
      loadInitiativesInViewport();
    };

    map.current.on('moveend', handleMoveEnd);
    map.current.on('zoomend', handleMoveEnd);

    return () => {
      if (map.current) {
        map.current.off('moveend', handleMoveEnd);
        map.current.off('zoomend', handleMoveEnd);
      }
    };
  }, [isLoaded, loadInitiativesInViewport]);

  // ================================
  // FRANCE MASK (Gray out other countries) - DISABLED
  // ================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addFranceMask = useCallback(() => {
    if (!map.current) return;

    // Create a polygon covering the world with a hole for France
    // This creates a "donut" shape: world boundary minus France
    const worldBounds = [
      [-180, -90],
      [-180, 90],
      [180, 90],
      [180, -90],
      [-180, -90],
    ];

    const franceBounds = [
      [-5.5, 41.0], // Southwest
      [-5.5, 51.5], // Northwest
      [10.0, 51.5], // Northeast
      [10.0, 41.0], // Southeast
      [-5.5, 41.0], // Close the loop
    ];

    // Add source with polygon (world minus France hole)
    map.current.addSource('world-mask', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [worldBounds, franceBounds], // Outer ring and inner hole
        },
      },
    });

    // Add semi-transparent gray layer
    map.current.addLayer({
      id: 'world-mask-layer',
      type: 'fill',
      source: 'world-mask',
      paint: {
        'fill-color': '#e5e7eb', // Light gray
        'fill-opacity': 0.7, // Semi-transparent
      },
    });
  }, []);

  // ================================
  // MAPBOX SOURCES CONFIGURATION
  // ================================

  const setupMapSources = useCallback(() => {
    if (!map.current) return;

    // Source for initiatives (points)
    if (!map.current.getSource('initiatives')) {
      map.current.addSource('initiatives', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: enableClustering,
        clusterMaxZoom: 11, // Stop clustering at zoom 11 (was 14)
        clusterRadius: 60, // Cluster radius in pixels (increased for better performance)
        clusterProperties: {
          // Calculate sum of points in each cluster
          sum: ['+', ['get', 'point_count']],
        },
        // ✨ CRITICAL: Tell Mapbox to use properties.id as feature ID
        // This allows feature-state to work with string UUIDs
        promoteId: 'id',
      });
    }

    // ✨ Load gradient marker images for each initiative type
    // Check if already loaded
    if (map.current.hasImage('marker-Ressourcerie')) {
      if (setupMapLayersRef.current) {
        setupMapLayersRef.current(); // Images already loaded, setup layers
      }
      return;
    }

    // ✨ Load cluster gradient images (3 sizes: small, medium, large)
    const clusterGradients = [
      { name: 'small', from: '#10b981', to: '#059669', size: 48, radius: 20 }, // emerald-500 to emerald-600
      { name: 'medium', from: '#06b6d4', to: '#0891b2', size: 68, radius: 28 }, // cyan-500 to cyan-600
      { name: 'large', from: '#6366f1', to: '#4f46e5', size: 92, radius: 38 }, // indigo-500 to indigo-600
    ];

    const clusterImagePromises = clusterGradients.map((cluster) => {
      return new Promise<void>((resolve) => {
        const safeClusterName = `cluster-${cluster.name}`;

        const svg = `
        <svg width="${cluster.size}" height="${cluster.size}" viewBox="0 0 ${
          cluster.size
        } ${cluster.size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${safeClusterName}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:${
                cluster.from
              };stop-opacity:0.85" />
              <stop offset="100%" style="stop-color:${
                cluster.to
              };stop-opacity:0.85" />
            </linearGradient>
            <filter id="blur-${safeClusterName}">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
            </filter>
          </defs>
          <circle cx="${cluster.size / 2}" cy="${cluster.size / 2}" r="${
            cluster.radius
          }" fill="url(#grad-${safeClusterName})" filter="url(#blur-${safeClusterName})" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        </svg>
      `;

        const img = new Image(cluster.size, cluster.size);
        img.onload = () => {
          if (map.current && !map.current.hasImage(safeClusterName)) {
            map.current.addImage(safeClusterName, img, { sdf: false });
          }
          resolve();
        };
        img.onerror = () => {
          resolve(); // Resolve anyway to not block
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
    });

    // Define gradient colors for each type EXACTLY matching FilterPanel badges
    const typeGradients: Record<string, { from: string; to: string }> = {
      Ressourcerie: { from: '#94a3b8', to: '#4b5563' }, // slate-400 to gray-600
      'Repair Café': { from: '#fbbf24', to: '#ea580c' }, // amber-400 to orange-600
      AMAP: { from: '#34d399', to: '#16a34a' }, // emerald-400 to green-600
      "Entreprise d'insertion": { from: '#60a5fa', to: '#4f46e5' }, // blue-400 to indigo-600
      'Point de collecte': { from: '#c084fc', to: '#7c3aed' }, // purple-400 to violet-600
      Recyclerie: { from: '#2dd4bf', to: '#0891b2' }, // teal-400 to cyan-600
      'Épicerie sociale': { from: '#fb7185', to: '#db2777' }, // rose-400 to pink-600
      'Jardin partagé': { from: '#a3e635', to: '#16a34a' }, // lime-400 to green-600
      'Fab Lab': { from: '#a78bfa', to: '#7c3aed' }, // violet-400 to purple-600
      Coopérative: { from: '#38bdf8', to: '#2563eb' }, // sky-400 to blue-600
      'Monnaie locale': { from: '#facc15', to: '#f59e0b' }, // yellow-400 to amber-600
      'Tiers-lieu': { from: '#e879f9', to: '#db2777' }, // fuchsia-400 to pink-600
      Autre: { from: '#9ca3af', to: '#64748b' }, // gray-400 to slate-600
      Friperie: { from: '#f472b6', to: '#e11d48' }, // pink-400 to rose-600 🆕 ADDED
    };

    // Create TWO versions for each type: normal (no shadow) and hover (with shadow)
    const markerImagePromises = Object.entries(typeGradients).flatMap(
      ([type, gradient]) => {
        const size = 32;
        const radius = 12;
        const safeType = type.replace(/[^a-zA-Z0-9]/g, '-');

        // Promise for NORMAL marker
        const normalPromise = new Promise<void>((resolve) => {
          const normalSvg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${safeType}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:0.85" />
              <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:0.85" />
            </linearGradient>
            <filter id="blur-${safeType}">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
            </filter>
          </defs>
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="url(#grad-${safeType})" filter="url(#blur-${safeType})" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
        </svg>
      `;

          const normalImg = new Image(size, size);
          normalImg.onload = () => {
            if (map.current && !map.current.hasImage(`marker-${type}`)) {
              map.current.addImage(`marker-${type}`, normalImg, { sdf: false });
            }
            resolve();
          };
          normalImg.onerror = () => {
            resolve(); // Resolve anyway to not block
          };
          normalImg.src =
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(normalSvg);
        });

        // Promise for HOVER marker
        const hoverPromise = new Promise<void>((resolve) => {
          const hoverSvg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-${safeType}-hover" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:0.85" />
              <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:0.85" />
            </linearGradient>
            <filter id="blur-${safeType}-hover">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
            </filter>
            <filter id="shadow-${safeType}" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.45"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="url(#grad-${safeType}-hover)" filter="url(#blur-${safeType}-hover) url(#shadow-${safeType})" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
        </svg>
      `;

          const hoverImg = new Image(size, size);
          hoverImg.onload = () => {
            if (map.current && !map.current.hasImage(`marker-${type}-hover`)) {
              map.current.addImage(`marker-${type}-hover`, hoverImg, {
                sdf: false,
              });
            }
            resolve();
          };
          hoverImg.onerror = () => {
            resolve(); // Resolve anyway to not block
          };
          hoverImg.src =
            'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(hoverSvg);
        });

        return [normalPromise, hoverPromise];
      }
    );

    // Wait for ALL images to load before setting up layers
    Promise.all([...clusterImagePromises, ...markerImagePromises])
      .then(() => {
        // Setup layers after images are loaded
        if (map.current && setupMapLayersRef.current) {
          setupMapLayersRef.current();
        }
      })
      .catch((err) => {
        console.error('Error loading marker images:', err);
        // Setup layers anyway
        if (map.current && setupMapLayersRef.current) {
          setupMapLayersRef.current();
        }
      });
  }, [enableClustering]);

  // ================================
  // LAYERS CONFIGURATION
  // ================================

  const setupMapLayers = useCallback(() => {
    if (!map.current) return;

    // Heatmap layer (visible at low zoom levels) - Simple vibrant gradient with pulsing animation
    // Clean emerald → cyan → indigo progression
    if (!map.current.getLayer('heatmap')) {
      map.current.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'initiatives',
        maxzoom: 9, // Only show heatmap when zoomed out
        paint: {
          // High intensity for maximum visibility
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1.8,
            9,
            4.5,
          ],
          // Simple 3-color gradient: Emerald → Cyan → Indigo
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(16, 185, 129, 0)', // Transparent
            0.2,
            'rgba(16, 185, 129, 0.7)', // Emerald green
            0.5,
            'rgba(6, 182, 212, 0.85)', // Cyan
            0.8,
            'rgba(99, 102, 241, 0.95)', // Indigo
            1,
            'rgba(99, 102, 241, 1)', // Bright indigo hotspot
          ],
          // Animated radius with pulsing effect (will be animated)
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 8, 9, 40],
          // High opacity for visibility
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6,
            0.95,
            7,
            1,
            9,
            0,
          ],
        },
      });

      // ✨ Start pulsing animation for heatmap - Ultra smooth breathing effect
      let pulseDirection = 1; // 1 = growing, -1 = shrinking
      let currentRadiusMultiplier = 1.0;
      const minRadius = 0.95; // Very subtle range (95% to 105%)
      const maxRadius = 1.05;
      const pulseSpeed = 0.002; // Much slower for gentle breathing

      const animateHeatmap = () => {
        if (!map.current || !map.current.getLayer('heatmap')) return;

        // Update radius multiplier
        currentRadiusMultiplier += pulseSpeed * pulseDirection;

        // Reverse direction at bounds
        if (currentRadiusMultiplier >= maxRadius) {
          pulseDirection = -1;
        } else if (currentRadiusMultiplier <= minRadius) {
          pulseDirection = 1;
        }

        // Apply animated radius to ALL zoom levels (full interpolation range)
        map.current.setPaintProperty('heatmap', 'heatmap-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          8 * currentRadiusMultiplier,
          3,
          15 * currentRadiusMultiplier,
          6,
          25 * currentRadiusMultiplier,
          9,
          40 * currentRadiusMultiplier,
        ]);

        requestAnimationFrame(animateHeatmap);
      };

      // Start animation
      animateHeatmap();
    }

    // Clusters with MODERN GRADIENT style - Clean horizontal gradients with diffuse shadow ✨
    if (enableClustering) {
      // Modern cluster circles with gradient images
      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'symbol',
          source: 'initiatives',
          filter: ['has', 'point_count'],
          minzoom: 9,
          maxzoom: 14,
          layout: {
            'icon-image': [
              'step',
              ['get', 'point_count'],
              'cluster-small', // 1-50
              50,
              'cluster-medium', // 50-200
              200,
              'cluster-large', // 200+
            ],
            'icon-size': 1.0,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          },
          paint: {
            'icon-opacity': 1,
          },
        });
      }

      // Cluster numbers - Clean white text
      if (!map.current.getLayer('cluster-count')) {
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'initiatives',
          filter: ['has', 'point_count'],
          minzoom: 9,
          maxzoom: 14,
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
            'text-size': [
              'step',
              ['get', 'point_count'],
              16, // Small clusters
              50,
              20, // Medium clusters
              200,
              26, // Large clusters
            ],
            'text-letter-spacing': 0.05,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0, 0, 0, 0)', // Transparent - NO shadow
            'text-halo-width': 0, // NO shadow
            'text-halo-blur': 0,
          },
        });
      }
    }

    // Individual points with gradient images - TRUE GRADIENT like FilterPanel badges!
    if (!map.current.getLayer('unclustered-point')) {
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9,
        layout: {
          'icon-image': ['concat', 'marker-', ['get', 'type']],
          'icon-size': 1.0,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-opacity': 1,
        },
      });
    }

    // Hover glow effect - animated colored circle
    if (!map.current.getLayer('unclustered-point-hover-glow')) {
      map.current.addLayer({
        id: 'unclustered-point-hover-glow',
        type: 'circle',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9,
        paint: {
          // Animated radius on hover
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0],
            0,
            0,
            1,
            28,
          ],
          // Match gradient start color for glow
          'circle-color': [
            'match',
            ['get', 'type'],
            'Ressourcerie',
            '#94a3b8',
            'Repair Café',
            '#fbbf24',
            'AMAP',
            '#34d399',
            "Entreprise d'insertion",
            '#60a5fa',
            'Point de collecte',
            '#c084fc',
            'Recyclerie',
            '#2dd4bf',
            'Épicerie sociale',
            '#fb7185',
            'Jardin partagé',
            '#a3e635',
            'Fab Lab',
            '#a78bfa',
            'Coopérative',
            '#38bdf8',
            'Monnaie locale',
            '#facc15',
            'Tiers-lieu',
            '#e879f9',
            'Friperie',
            '#f472b6',
            '#9ca3af',
          ],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0],
            0,
            0,
            1,
            0.4,
          ],
          'circle-blur': 1.0,
        },
      });
    }

    // Scale effect - duplicate marker that appears larger on hover WITH shadow
    if (!map.current.getLayer('unclustered-point-hover-scale')) {
      map.current.addLayer({
        id: 'unclustered-point-hover-scale',
        type: 'symbol',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9,
        layout: {
          // Use hover version with shadow
          'icon-image': ['concat', 'marker-', ['get', 'type'], '-hover'],
          'icon-size': 1.25, // 25% larger
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          // Only visible on hover
          'icon-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0,
          ],
        },
      });
    }

    // Labels for individual points (visible at high zoom)
    if (!map.current.getLayer('unclustered-point-label')) {
      map.current.addLayer({
        id: 'unclustered-point-label',
        type: 'symbol',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 13, // Only show labels at high zoom
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-max-width': 10,
        },
        paint: {
          'text-color': '#1f2937',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
          'text-halo-blur': 0.5,
        },
      });
    }
  }, [enableClustering]);

  // Store setupMapLayers function in ref for use in setupMapSources
  setupMapLayersRef.current = setupMapLayers;

  // ================================
  // MAP INTERACTIONS
  // ================================

  // ✨ Track hovered marker (MUST be outside setupMapInteractions to persist)
  const hoveredMarkerIdRef = useRef<string | number | null>(null);

  const setupMapInteractions = useCallback(() => {
    if (!map.current) return;

    // Create a popup for hover interactions (can be interacted with)
    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'hover-popup interactive-popup',
      closeOnMove: false, // Don't close when map moves slightly
    });

    // Track if mouse is over popup or marker
    let isOverMarker = false;
    let isOverPopup = false;
    let currentInitiative: Initiative | null = null;

    // Function to remove popup only if not hovering marker or popup
    const tryRemovePopup = () => {
      setTimeout(() => {
        if (!isOverMarker && !isOverPopup) {
          hoverPopup.remove();
          currentInitiative = null;
        }
      }, 100); // Small delay to allow mouse to move to popup
    };

    // ✨ Clusters cursor pointer (hover animations via CSS transitions)
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    // ✨ MODERN HOVER ANIMATIONS - Individual markers with gradient (scale + colored glow)

    map.current.on('mouseenter', 'unclustered-point', (e) => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';
      isOverMarker = true;

      const feature = e.features?.[0];
      if (feature) {
        const featureId = feature.id || feature.properties?.id;

        if (featureId !== undefined && featureId !== null) {
          hoveredMarkerIdRef.current = featureId;

          // Set hover state for both glow and scale layers
          map.current.setFeatureState(
            { source: 'initiatives', id: featureId },
            { hover: true }
          );
        }
      }

      const features = e.features?.[0];
      if (features?.properties) {
        const initiative = JSON.parse(
          features.properties.initiative
        ) as Initiative;
        currentInitiative = initiative;

        const gradient = TYPE_GRADIENTS_CSS[initiative.type];
        const verifiedBadge = initiative.verified
          ? `<div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white ml-2 shadow-md" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Vérifiée
            </div>`
          : '';

        // Get initiative description for tooltip
        const typeDescription =
          INITIATIVE_DESCRIPTIONS[initiative.type] || initiative.type;

        // Create modern glassmorphism popup HTML with blurred background
        const html = `
          <div style="width: 280px; padding: 20px; box-sizing: border-box;">
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px;">
              <div class="popup-badge" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; color: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); background: ${gradient};">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">${
                  initiative.type
                }</span>
                <button 
                  class="info-btn-popup"
                  data-initiative-id="${initiative.id}"
                  data-description="${typeDescription.replace(/"/g, '&quot;')}"
                  style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; min-width: 24px; min-height: 24px; padding: 3px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); border: none; cursor: pointer; transition: background 0.2s; color: white; flex-shrink: 0;"
                  aria-label="Information sur ${initiative.type}"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </button>
              </div>
              ${verifiedBadge}
            </div>
            
            <h2 class="font-bold text-lg mb-2" style="color: #0f2419; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto;">${
              initiative.name
            }</h2>
            
            ${
              initiative.address
                ? `<div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; padding: 12px 14px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.2); overflow: hidden;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style="color: #064e3b; font-size: 13px; line-height: 1.4; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; flex: 1; min-width: 0;">${initiative.address}</span>
                  </div>`
                : ''
            }
            
            ${
              initiative.description
                ? `<p style="color: #1f2937; font-size: 13px; line-height: 1.6; margin-top: 10px; font-weight: 400; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto;">${initiative.description.substring(
                    0,
                    120
                  )}${initiative.description.length > 120 ? '...' : ''}</p>`
                : ''
            }
            
            <button 
              class="popup-detail-btn mt-4 pt-3 flex items-center justify-between w-full" 
              style="border-top: 1px solid rgba(148, 163, 184, 0.25); cursor: pointer; background: none; border-left: none; border-right: none; border-bottom: none; padding-left: 0; padding-right: 0; transition: all 0.2s;"
              onmouseover="this.style.transform='translateX(4px)'"
              onmouseout="this.style.transform='translateX(0)'"
            >
              <span style="color: #10b981; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Cliquez pour tous les détails
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        `;

        hoverPopup
          .setLngLat(
            (features.geometry as GeoJSON.Point).coordinates as [number, number]
          )
          .setHTML(html)
          .addTo(map.current);

        // Add event listeners to popup after it's added to DOM
        setTimeout(() => {
          const popupElement = document.querySelector('.interactive-popup');
          if (popupElement) {
            popupElement.addEventListener('mouseenter', () => {
              isOverPopup = true;
            });
            popupElement.addEventListener('mouseleave', () => {
              isOverPopup = false;
              tryRemovePopup();
            });

            // Add click handler for detail button
            const detailBtn = popupElement.querySelector('.popup-detail-btn');
            if (detailBtn && currentInitiative) {
              detailBtn.addEventListener('click', () => {
                if (currentInitiative && onInitiativeClick) {
                  onInitiativeClick(currentInitiative);
                  hoverPopup.remove();
                }
              });
            }

            // Add tooltip handler for info button
            const infoBtn = popupElement.querySelector(
              '.info-btn-popup'
            ) as HTMLButtonElement;
            if (infoBtn) {
              let tooltipDiv: HTMLDivElement | null = null;

              infoBtn.addEventListener('mouseenter', () => {
                infoBtn.style.background = 'rgba(255, 255, 255, 0.35)';

                // Create tooltip in body
                const description =
                  infoBtn.getAttribute('data-description') || '';
                const initiativeId =
                  infoBtn.getAttribute('data-initiative-id') || '';

                tooltipDiv = document.createElement('div');
                tooltipDiv.id = `tooltip-popup-${initiativeId}`;
                tooltipDiv.style.cssText = `
                  position: fixed;
                  width: 240px;
                  padding: 10px 14px;
                  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
                  backdrop-filter: blur(12px);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  color: white;
                  border-radius: 8px;
                  font-size: 12px;
                  line-height: 1.5;
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                  z-index: 999999;
                  pointer-events: none;
                  opacity: 1;
                  visibility: visible;
                  transition: opacity 0.2s, visibility 0.2s;
                `;

                tooltipDiv.innerHTML = `
                  ${description}
                  <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgba(15, 23, 42, 0.98);"></div>
                `;

                document.body.appendChild(tooltipDiv);

                // Position tooltip
                const rect = infoBtn.getBoundingClientRect();
                tooltipDiv.style.left = `${rect.left + rect.width / 2}px`;
                tooltipDiv.style.top = `${rect.top - tooltipDiv.offsetHeight - 10}px`;
                tooltipDiv.style.transform = 'translateX(-50%)';
              });

              infoBtn.addEventListener('mouseleave', () => {
                infoBtn.style.background = 'rgba(255, 255, 255, 0.2)';

                if (tooltipDiv) {
                  tooltipDiv.remove();
                  tooltipDiv = null;
                }
              });
            }
          }
        }, 50);
      }
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
        isOverMarker = false;
        tryRemovePopup();

        if (
          hoveredMarkerIdRef.current !== null &&
          hoveredMarkerIdRef.current !== undefined
        ) {
          // Remove hover state
          map.current.setFeatureState(
            { source: 'initiatives', id: hoveredMarkerIdRef.current },
            { hover: false }
          );

          hoveredMarkerIdRef.current = null;
        }
      }
    });

    // ✨ Heatmap cursor pointer
    map.current.on('mouseenter', 'heatmap', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'heatmap', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    // Click on cluster: zoom
    map.current.on('click', 'clusters', (e) => {
      if (!map.current) return;

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });

      const clusterId = features[0]?.properties?.cluster_id;
      if (clusterId) {
        const source = map.current.getSource(
          'initiatives'
        ) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null || zoom === undefined)
            return;

          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [
              number,
              number,
            ],
            zoom,
          });
        });
      }
    });

    // Click on heatmap: zoom in to that location
    map.current.on('click', 'heatmap', (e) => {
      if (!map.current) return;

      // Zoom in by 2 levels to the clicked location
      map.current.easeTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: map.current.getZoom() + 2,
        duration: 500,
      });
    });

    // Click on point: show details
    map.current.on('click', 'unclustered-point', (e) => {
      const features = e.features?.[0];
      if (features?.properties) {
        const initiative = JSON.parse(
          features.properties.initiative
        ) as Initiative;

        // Remove hover popup when clicking
        hoverPopup.remove();

        if (onInitiativeClick) {
          onInitiativeClick(initiative);
        }
      }
    });

    // Click on map
    map.current.on('click', (e) => {
      const features = map.current?.queryRenderedFeatures(e.point, {
        layers: ['heatmap', 'clusters', 'unclustered-point'],
      });

      // If we didn't click on a heatmap/marker/cluster
      if (!features?.length && onMapClick) {
        onMapClick([e.lngLat.lng, e.lngLat.lat]);
      }
    });
  }, [onInitiativeClick, onMapClick]);

  // ================================
  // DATA UPDATE
  // ================================

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource(
      'initiatives'
    ) as mapboxgl.GeoJSONSource;
    if (!source) return;

    // Convert to GeoJSON
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: initiatives.map((initiative) => ({
        type: 'Feature' as const,
        id: initiative.id, // ✨ Add ID for feature-state to work
        geometry: initiative.location,
        properties: {
          id: initiative.id,
          name: initiative.name,
          type: initiative.type,
          verified: initiative.verified,
          initiative: JSON.stringify(initiative), // Données complètes pour les popups
        },
      })),
    };

    source.setData(geojsonData);

    // Auto-fit si demandé
    if (autoFit && initiatives.length > 0) {
      const coordinates = initiatives.map((i) => i.location.coordinates);
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
      });
    }
  }, [initiatives, isLoaded, autoFit]);

  // ================================
  // PUBLIC METHODS (exposed via ref if needed)
  // ================================

  const _flyTo = useCallback((coordinates: [number, number], zoom = 14) => {
    if (map.current) {
      map.current.flyTo({ center: coordinates, zoom });
    }
  }, []);

  const _fitBounds = useCallback(
    (bounds: [[number, number], [number, number]]) => {
      if (map.current) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    },
    []
  );

  // ================================
  // RENDU
  // ================================

  return (
    <div className="relative h-full w-full">
      {/* Conteneur de la carte */}
      <div
        ref={mapContainer}
        className={className || 'h-full w-full'}
        data-testid="map-container"
      />

      {/* Affichage d'erreur */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur de chargement
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setError(null);
                      loadInitiativesInViewport();
                    }}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur les données */}
      <div className="absolute bottom-4 left-[8rem] z-10 flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <span className="text-xs text-gray-600">
            {initiatives.length >= 1000 ? (
              <>
                <span
                  className="font-black text-emerald-500 animate-pulse"
                  style={{
                    textShadow:
                      '0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.4)',
                    fontSize: '0.9rem',
                  }}
                >
                  +
                </span>
                <span className="font-semibold">1000</span>
              </>
            ) : (
              initiatives.length.toLocaleString('fr-FR')
            )}{' '}
            initiative{initiatives.length > 1 ? 's' : ''} affichée
            {initiatives.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Indicateur de chargement discret */}
        {loading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
            <span className="text-xs text-gray-600">Chargement...</span>
          </div>
        )}
      </div>
    </div>
  );
}

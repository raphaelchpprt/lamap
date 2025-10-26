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
  type DatabaseInitiative,
} from '@/lib/supabase/types';
import { TYPE_GRADIENTS, TYPE_MARKER_COLORS } from '@/types/initiative';

import type { Initiative, InitiativeFilters } from '@/types/initiative';

// ================================
// CONFIGURATION
// ================================

const DEFAULT_CONFIG = {
  style: 'mapbox://styles/mapbox/light-v11',
  center: [2.3522, 46.6034] as [number, number], // Center of France
  zoom: 6,
  minZoom: 6, // Can't zoom out to see other countries
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
          addFranceMask();
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
    if (!map.current || !isLoaded) return;

    // Clear any pending load timeout (debounce)
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Check if bounds changed significantly (avoid reload on tiny movements)
    const currentBounds = map.current.getBounds();
    if (lastBoundsRef.current && currentBounds) {
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
          data: DatabaseInitiative[] | null;
          error: { message: string } | null;
        };

        if (dbError) {
          throw new Error(`Erreur Supabase: ${dbError.message}`);
        }

        const formattedInitiatives = ((data as DatabaseInitiative[]) || []).map(
          databaseInitiativeToInitiative
        );
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
  // FRANCE MASK (Gray out other countries)
  // ================================

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
        clusterMaxZoom: 14, // Stop clustering at zoom 14
        clusterRadius: 60, // Cluster radius in pixels (increased for better performance)
        clusterProperties: {
          // Calculate sum of points in each cluster
          sum: ['+', ['get', 'point_count']],
        },
      });
    }
  }, [enableClustering]);

  // ================================
  // LAYERS CONFIGURATION
  // ================================

  const setupMapLayers = useCallback(() => {
    if (!map.current) return;

    // Heatmap layer (visible at low zoom levels) - Simple vibrant gradient
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
          // Large radius for dramatic effect
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
    }

    // Clusters with simple vibrant gradient (matching heatmap)
    if (enableClustering) {
      // Outer glow for clusters
      if (!map.current.getLayer('clusters-glow')) {
        map.current.addLayer({
          id: 'clusters-glow',
          type: 'circle',
          source: 'initiatives',
          filter: ['has', 'point_count'],
          minzoom: 9,
          maxzoom: 14,
          paint: {
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              26, // Small clusters
              50,
              38, // Medium clusters
              200,
              52, // Large clusters
            ],
            // Simple 3-color glow: Emerald → Cyan → Indigo
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#10b981', // Emerald (1-50)
              50,
              '#06b6d4', // Cyan (50-200)
              200,
              '#6366f1', // Indigo (200+)
            ],
            'circle-opacity': 0.45,
            'circle-blur': 1.8,
          },
        });
      }

      // Main cluster circles - Simple emerald → cyan → indigo
      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'initiatives',
          filter: ['has', 'point_count'],
          minzoom: 9,
          maxzoom: 14,
          paint: {
            // Simple 3-color gradient matching heatmap
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#10b981', // Emerald green (1-50)
              50,
              '#06b6d4', // Cyan (50-200)
              200,
              '#6366f1', // Indigo hotspot (200+)
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              22, // Small clusters
              50,
              34, // Medium clusters
              200,
              48, // Large clusters
            ],
            'circle-stroke-width': 4,
            'circle-stroke-color': 'rgba(255, 255, 255, 1)',
            'circle-opacity': 0.95,
          },
        });
      }

      // Numbers on clusters with better contrast
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
            'text-size': 15,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0, 0, 0, 0.3)',
            'text-halo-width': 1.5,
            'text-halo-blur': 0.5,
          },
        });
      }
    }

    // Shadow effect matching FilterPanel's shadow-lg (main shadow)
    if (!map.current.getLayer('unclustered-point-glow')) {
      map.current.addLayer({
        id: 'unclustered-point-glow',
        type: 'circle',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            16,
            12,
            24,
            16,
            34,
          ],
          'circle-color': [
            'match',
            ['get', 'type'],
            'Ressourcerie',
            TYPE_MARKER_COLORS['Ressourcerie'],
            'Repair Café',
            TYPE_MARKER_COLORS['Repair Café'],
            'AMAP',
            TYPE_MARKER_COLORS['AMAP'],
            "Entreprise d'insertion",
            TYPE_MARKER_COLORS["Entreprise d'insertion"],
            'Point de collecte',
            TYPE_MARKER_COLORS['Point de collecte'],
            'Recyclerie',
            TYPE_MARKER_COLORS['Recyclerie'],
            'Épicerie sociale',
            TYPE_MARKER_COLORS['Épicerie sociale'],
            'Jardin partagé',
            TYPE_MARKER_COLORS['Jardin partagé'],
            'Fab Lab',
            TYPE_MARKER_COLORS['Fab Lab'],
            'Coopérative',
            TYPE_MARKER_COLORS['Coopérative'],
            'Monnaie locale',
            TYPE_MARKER_COLORS['Monnaie locale'],
            'Tiers-lieu',
            TYPE_MARKER_COLORS['Tiers-lieu'],
            TYPE_MARKER_COLORS['Autre'],
          ],
          'circle-opacity': 0.6,
          'circle-blur': 0.5,
        },
      });
    }

    // Darker shadow offset (simulating shadow-lg bottom-right offset)
    if (!map.current.getLayer('unclustered-point-shadow')) {
      map.current.addLayer({
        id: 'unclustered-point-shadow',
        type: 'circle',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            10,
            12,
            15,
            16,
            22,
          ],
          'circle-color': '#000000', // Dark shadow
          'circle-opacity': 0.15, // Subtle dark shadow
          'circle-blur': 0.3,
          // Offset shadow to bottom-right
          'circle-translate': [2, 2], // X, Y offset in pixels
        },
      });
    }

    // Individual points - EXACT FilterPanel gradient colors (-400)
    if (!map.current.getLayer('unclustered-point')) {
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            8,
            12,
            14,
            16,
            20,
          ],
          // EXACT Tailwind -400 colors from FilterPanel gradients
          'circle-color': [
            'match',
            ['get', 'type'],
            'Ressourcerie',
            TYPE_MARKER_COLORS['Ressourcerie'], // slate-400
            'Repair Café',
            TYPE_MARKER_COLORS['Repair Café'], // amber-400
            'AMAP',
            TYPE_MARKER_COLORS['AMAP'], // emerald-400
            "Entreprise d'insertion",
            TYPE_MARKER_COLORS["Entreprise d'insertion"], // blue-400
            'Point de collecte',
            TYPE_MARKER_COLORS['Point de collecte'], // purple-400
            'Recyclerie',
            TYPE_MARKER_COLORS['Recyclerie'], // teal-400
            'Épicerie sociale',
            TYPE_MARKER_COLORS['Épicerie sociale'], // rose-400
            'Jardin partagé',
            TYPE_MARKER_COLORS['Jardin partagé'], // lime-400
            'Fab Lab',
            TYPE_MARKER_COLORS['Fab Lab'], // violet-400
            'Coopérative',
            TYPE_MARKER_COLORS['Coopérative'], // sky-400
            'Monnaie locale',
            TYPE_MARKER_COLORS['Monnaie locale'], // yellow-400
            'Tiers-lieu',
            TYPE_MARKER_COLORS['Tiers-lieu'], // fuchsia-400
            TYPE_MARKER_COLORS['Autre'], // gray-400
          ],
          'circle-stroke-width': 0, // NO border - flat design
          'circle-opacity': 1, // Full opacity for vibrant colors
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

  // ================================
  // MAP INTERACTIONS
  // ================================

  const setupMapInteractions = useCallback(() => {
    if (!map.current) return;

    // Create a popup for hover interactions
    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'hover-popup',
    });

    // Pointer cursor on interactive elements
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    // Hover on unclustered point: show modern happy popup
    map.current.on('mouseenter', 'unclustered-point', (e) => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';

      const features = e.features?.[0];
      if (features?.properties) {
        const initiative = JSON.parse(
          features.properties.initiative
        ) as Initiative;

        const gradient = TYPE_GRADIENTS[initiative.type];
        const verifiedBadge = initiative.verified
          ? `<div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white ml-2 shadow-md" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Vérifiée
            </div>`
          : '';

        // Create modern glassmorphism popup HTML with blurred background
        const html = `
          <div class="p-5 min-w-[280px]">
            <div class="flex items-start gap-2 mb-3">
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg" style="background: ${gradient};">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                ${initiative.type}
              </div>
              ${verifiedBadge}
            </div>
            
            <h2 class="font-bold text-lg mb-2" style="color: #0f2419; line-height: 1.3;">${
              initiative.name
            }</h2>
            
            ${
              initiative.address
                ? `<div class="flex items-start gap-2 mb-2 p-2.5 rounded-xl" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.2);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" class="flex-shrink-0 mt-0.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style="color: #064e3b; font-size: 13px; line-height: 1.4; font-weight: 500;">${initiative.address}</span>
                  </div>`
                : ''
            }
            
            ${
              initiative.description
                ? `<p style="color: #1f2937; font-size: 13px; line-height: 1.6; margin-top: 10px; font-weight: 400;">${initiative.description.substring(
                    0,
                    120
                  )}${initiative.description.length > 120 ? '...' : ''}</p>`
                : ''
            }
            
            <div class="mt-4 pt-3 flex items-center justify-between" style="border-top: 1px solid rgba(148, 163, 184, 0.25);">
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
            </div>
          </div>
        `;

        hoverPopup
          .setLngLat(
            (features.geometry as GeoJSON.Point).coordinates as [number, number]
          )
          .setHTML(html)
          .addTo(map.current);
      }
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
        hoverPopup.remove();
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
              number
            ],
            zoom,
          });
        });
      }
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
        layers: ['clusters', 'unclustered-point'],
      });

      // If we didn't click on a marker/cluster
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
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <span className="text-xs text-gray-600">
            {initiatives.length} initiative{initiatives.length > 1 ? 's' : ''}{' '}
            affichée{initiatives.length > 1 ? 's' : ''}
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

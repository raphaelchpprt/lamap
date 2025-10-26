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
import { INITIATIVE_COLORS } from '@/types/initiative';

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

    // Heatmap layer (visible at low zoom levels)
    if (!map.current.getLayer('heatmap')) {
      map.current.addLayer({
        id: 'heatmap',
        type: 'heatmap',
        source: 'initiatives',
        maxzoom: 9, // Only show heatmap when zoomed out
        paint: {
          // Intensity based on zoom level
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1,
            9,
            3,
          ],
          // Color ramp for heatmap
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            0.2,
            'rgb(103,169,207)',
            0.4,
            'rgb(209,229,240)',
            0.6,
            'rgb(253,219,199)',
            0.8,
            'rgb(239,138,98)',
            1,
            'rgb(178,24,43)',
          ],
          // Radius of each "point" on heatmap
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
          // Opacity
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0],
        },
      });
    }

    // Clusters
    if (enableClustering) {
      // Circles for clusters
      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'initiatives',
          filter: ['has', 'point_count'],
          minzoom: 9, // Show clusters starting at zoom 9
          maxzoom: 14, // Stop showing clusters at zoom 14
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#10b981', // Green for 1-50 points
              50,
              '#3b82f6', // Blue for 50-100 points
              100,
              '#f59e0b', // Orange for 100-500 points
              500,
              '#ef4444', // Red for 500+ points
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              15, // Radius for 1-50 points
              50,
              25, // 50-100 points
              100,
              35, // 100-500 points
              500,
              45, // 500+ points
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9,
          },
        });
      }

      // Numbers on clusters
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
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 14,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });
      }
    }

    // Individual points (not clustered, visible at high zoom)
    if (!map.current.getLayer('unclustered-point')) {
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
        minzoom: 9, // Only show individual points at zoom 9+
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            4,
            12,
            8,
            16,
            12,
          ],
          'circle-color': [
            'match',
            ['get', 'type'],
            'Ressourcerie',
            INITIATIVE_COLORS['Ressourcerie'],
            'Repair Café',
            INITIATIVE_COLORS['Repair Café'],
            'AMAP',
            INITIATIVE_COLORS['AMAP'],
            "Entreprise d'insertion",
            INITIATIVE_COLORS["Entreprise d'insertion"],
            'Point de collecte',
            INITIATIVE_COLORS['Point de collecte'],
            'Recyclerie',
            INITIATIVE_COLORS['Recyclerie'],
            'Épicerie sociale',
            INITIATIVE_COLORS['Épicerie sociale'],
            'Jardin partagé',
            INITIATIVE_COLORS['Jardin partagé'],
            'Fab Lab',
            INITIATIVE_COLORS['Fab Lab'],
            'Coopérative',
            INITIATIVE_COLORS['Coopérative'],
            'Monnaie locale',
            INITIATIVE_COLORS['Monnaie locale'],
            'Tiers-lieu',
            INITIATIVE_COLORS['Tiers-lieu'],
            INITIATIVE_COLORS['Autre'], // Default
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8,
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

    // Hover on unclustered point: show name
    map.current.on('mouseenter', 'unclustered-point', (e) => {
      if (!map.current) return;
      map.current.getCanvas().style.cursor = 'pointer';

      const features = e.features?.[0];
      if (features?.properties) {
        const initiative = JSON.parse(
          features.properties.initiative
        ) as Initiative;

        // Create popup HTML with title as main heading
        const html = `
          <div class="p-3">
            <h2 class="font-bold text-base mb-1">${initiative.name}</h2>
            <p class="text-xs text-gray-600">${initiative.type}</p>
            ${
              initiative.address
                ? `<p class="text-xs text-gray-500 mt-1">${initiative.address}</p>`
                : ''
            }
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

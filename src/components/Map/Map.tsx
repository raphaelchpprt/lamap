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
import { databaseInitiativeToInitiative } from '@/lib/supabase/types';
import { INITIATIVE_COLORS } from '@/types/initiative';

import type { Initiative, InitiativeFilters } from '@/types/initiative';

// ================================
// CONFIGURATION
// ================================

const DEFAULT_CONFIG = {
  style: 'mapbox://styles/mapbox/light-v11',
  center: [2.3522, 46.6034] as [number, number], // Center of France
  zoom: 6,
  minZoom: 5, // Prevent zooming out too far
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
  enableClustering = true,
  autoFit = false,
  initiatives: externalInitiatives,
}: MapProps) {
  // ================================
  // STATE // STATE & REFS REFS
  // ================================

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      });

      map.current.on('load', () => {
        setIsLoaded(true);
        if (map.current) {
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
  // LOADING INITIATIVES
  // ================================

  const loadInitiatives = useCallback(async () => {
    if (externalInitiatives) {
      setInitiatives(externalInitiatives);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      let query = supabase.from('initiatives').select('*');

      // Apply filters
      if (filters?.types?.length) {
        query = query.in('type', filters.types);
      }

      if (filters?.verified_only) {
        query = query.eq('verified', true);
      }

      if (filters?.search_query) {
        query = query.or(
          `name.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`
        );
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw new Error(`Erreur Supabase: ${dbError.message}`);
      }

      const formattedInitiatives = (data || []).map(
        databaseInitiativeToInitiative
      );
      setInitiatives(formattedInitiatives);
    } catch (err) {
      console.error('Erreur lors du chargement des initiatives:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [filters, externalInitiatives]);

  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

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
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });
    }
  }, [enableClustering]);

  // ================================
  // LAYERS CONFIGURATION
  // ================================

  const setupMapLayers = useCallback(() => {
    if (!map.current) return;

    // Clusters
    if (enableClustering) {
      // Circles for clusters
      if (!map.current.getLayer('clusters')) {
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'initiatives',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6', // Color for 1-10 points
              10,
              '#f1c40f', // 10-50 points
              50,
              '#e74c3c', // 50+ points
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20, // Radius for 1-10 points
              10,
              30, // 10-50 points
              50,
              40, // 50+ points
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
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
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });
      }
    }

    // Individual points (not clustered)
    if (!map.current.getLayer('unclustered-point')) {
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'initiatives',
        filter: enableClustering
          ? (['!', ['has', 'point_count']] as mapboxgl.FilterSpecification)
          : undefined,
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
  }, [enableClustering]);

  // ================================
  // MAP INTERACTIONS
  // ================================

  const setupMapInteractions = useCallback(() => {
    if (!map.current) return;

    // Pointer cursor on interactive elements
    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    map.current.on('mouseenter', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
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
      if (features?.properties && onInitiativeClick) {
        const initiative = JSON.parse(
          features.properties.initiative
        ) as Initiative;
        onInitiativeClick(initiative);
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

      {/* Indicateur de chargement */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
            <span className="text-sm font-medium">
              Chargement des initiatives...
            </span>
          </div>
        </div>
      )}

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
                      loadInitiatives();
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
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <span className="text-xs text-gray-600">
              {initiatives.length} initiative{initiatives.length > 1 ? 's' : ''}{' '}
              affichée{initiatives.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

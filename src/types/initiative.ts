/**
 * Types TypeScript pour LaMap - Cartographie des initiatives ESS
 *
 * Ces types définissent la structure des données pour les initiatives
 * d'économie circulaire, sociale et solidaire (ESS)
 */

// ================================
// TYPES PRINCIPAUX
// ================================

/**
 * Interface principale représentant une initiative ESS
 */
export interface Initiative {
  /** Identifiant unique UUID généré par Supabase */
  id: string;

  /** Nom de l'initiative */
  name: string;

  /** Type/catégorie de l'initiative */
  type: InitiativeType;

  /** Description détaillée (optionnelle) */
  description?: string;

  /** Adresse textuelle de l'initiative */
  address?: string;

  /** Coordonnées géospatiales (format GeoJSON Point) */
  location: GeoJSONPoint;

  /** Statut de vérification par les modérateurs */
  verified: boolean;

  /** URL de l'image de présentation */
  image_url?: string;

  /** Site web officiel */
  website?: string;

  /** Numéro de téléphone */
  phone?: string;

  /** Adresse email de contact */
  email?: string;

  /** Horaires d'ouverture par jour de la semaine */
  opening_hours?: OpeningHours;

  /** ID de l'utilisateur ayant créé l'initiative */
  user_id?: string;

  /** Date de création (ISO string) */
  created_at: string;

  /** Date de dernière modification (ISO string) */
  updated_at: string;
}

/**
 * Types d'initiatives supportées par LaMap
 * Basé sur l'écosystème ESS français
 */
export type InitiativeType =
  | 'Ressourcerie' // Collecte, tri, remise en état et vente d'objets
  | 'Repair Café' // Ateliers de réparation collaboratifs
  | 'AMAP' // Association pour le Maintien d'une Agriculture Paysanne
  | "Entreprise d'insertion" // Structures d'insertion par l'activité économique
  | 'Point de collecte' // Points de collecte de déchets spécialisés
  | 'Recyclerie' // Centres de recyclage et valorisation
  | 'Épicerie sociale' // Magasins solidaires à prix réduits
  | 'Jardin partagé' // Espaces de jardinage collectif
  | 'Fab Lab' // Laboratoires de fabrication numérique
  | 'Coopérative' // Structures coopératives diverses
  | 'Monnaie locale' // Systèmes d'échange locaux
  | 'Tiers-lieu' // Espaces de coworking et innovation sociale
  | 'Autre'; // Autres initiatives ESS

/**
 * Structure des horaires d'ouverture
 * Chaque jour peut avoir des horaires ou être fermé (null)
 */
export interface OpeningHours {
  /** Lundi */
  monday?: TimeSlot | null;
  /** Mardi */
  tuesday?: TimeSlot | null;
  /** Mercredi */
  wednesday?: TimeSlot | null;
  /** Jeudi */
  thursday?: TimeSlot | null;
  /** Vendredi */
  friday?: TimeSlot | null;
  /** Samedi */
  saturday?: TimeSlot | null;
  /** Dimanche */
  sunday?: TimeSlot | null;
}

/**
 * Créneau horaire pour un jour donné
 */
export interface TimeSlot {
  /** Heure d'ouverture (format HH:MM) */
  open: string;
  /** Heure de fermeture (format HH:MM) */
  close: string;
  /** Pause déjeuner éventuelle */
  break?: {
    start: string;
    end: string;
  };
}

// ================================
// TYPES GÉOGRAPHIQUES
// ================================

/**
 * Point géographique au format GeoJSON
 * Conforme à la spécification RFC 7946
 */
export interface GeoJSONPoint {
  type: 'Point';
  /** Coordonnées [longitude, latitude] */
  coordinates: [number, number];
}

/**
 * Bounds géographiques pour délimiter une zone
 */
export interface GeoBounds {
  /** Coordonnée sud-ouest */
  southwest: {
    latitude: number;
    longitude: number;
  };
  /** Coordonnée nord-est */
  northeast: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Paramètres de recherche géographique
 */
export interface GeoSearchParams {
  /** Centre de recherche */
  center: {
    latitude: number;
    longitude: number;
  };
  /** Rayon de recherche en kilomètres */
  radius?: number;
  /** Zone de délimitation */
  bounds?: GeoBounds;
}

// ================================
// TYPES POUR LES FORMULAIRES
// ================================

/**
 * Données du formulaire de création d'initiative
 * (sans les champs générés automatiquement)
 */
export interface InitiativeFormData {
  name: string;
  type: InitiativeType;
  description?: string;
  address?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  image?: File | string;
  website?: string;
  phone?: string;
  email?: string;
  opening_hours?: OpeningHours;
}

/**
 * Données partielles pour la modification d'initiative
 */
export type InitiativeUpdateData = Partial<
  Omit<Initiative, 'id' | 'created_at' | 'updated_at'>
>;

// ================================
// TYPES POUR LES FILTRES
// ================================

/**
 * Options de filtrage des initiatives
 */
export interface InitiativeFilters {
  /** Types d'initiatives à inclure */
  types?: InitiativeType[];
  /** Seulement les initiatives vérifiées */
  verified_only?: boolean;
  /** Recherche textuelle */
  search_query?: string;
  /** Filtrage géographique */
  geo_filter?: GeoSearchParams;
  /** Créées après cette date */
  created_after?: string;
  /** Créées avant cette date */
  created_before?: string;
}

/**
 * Options de tri des résultats
 */
export interface InitiativeSortOptions {
  /** Champ sur lequel trier */
  field: 'created_at' | 'updated_at' | 'name' | 'distance';
  /** Ordre de tri */
  order: 'asc' | 'desc';
}

// ================================
// TYPES POUR L'API
// ================================

/**
 * Réponse paginée de l'API
 */
export interface PaginatedResponse<T> {
  /** Données de la page courante */
  data: T[];
  /** Informations de pagination */
  pagination: {
    /** Page courante (commence à 1) */
    current_page: number;
    /** Nombre d'éléments par page */
    per_page: number;
    /** Nombre total d'éléments */
    total_count: number;
    /** Nombre total de pages */
    total_pages: number;
    /** Lien vers la page suivante */
    next_page?: number;
    /** Lien vers la page précédente */
    prev_page?: number;
  };
}

/**
 * Réponse standard de l'API LaMap
 */
export interface ApiResponse<T = unknown> {
  /** Succès de l'opération */
  success: boolean;
  /** Données de réponse */
  data?: T;
  /** Message d'information */
  message?: string;
  /** Détails de l'erreur */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ================================
// TYPES POUR MAPBOX
// ================================

/**
 * Configuration de la carte Mapbox
 */
export interface MapConfig {
  /** Token d'accès Mapbox */
  accessToken: string;
  /** Style de la carte */
  style: string;
  /** Centre initial */
  center: [number, number];
  /** Zoom initial */
  zoom: number;
  /** Zoom minimum */
  minZoom?: number;
  /** Zoom maximum */
  maxZoom?: number;
}

/**
 * Propriétés d'un marker sur la carte
 */
export interface MapMarker {
  /** Identifiant unique */
  id: string;
  /** Coordonnées */
  coordinates: [number, number];
  /** Type d'initiative pour le style */
  type: InitiativeType;
  /** Données complètes de l'initiative */
  initiative: Initiative;
}

/**
 * Événement de clic sur la carte
 */
export interface MapClickEvent {
  /** Coordonnées du clic */
  coordinates: [number, number];
  /** Initiatives à proximité du clic */
  nearby_initiatives?: Initiative[];
}

// ================================
// TYPES D'UTILITAIRES
// ================================

/**
 * Couleurs associées aux types d'initiatives
 */
export const INITIATIVE_COLORS: Record<InitiativeType, string> = {
  Ressourcerie: '#10b981', // Vert primary
  'Repair Café': '#f59e0b', // Orange accent
  AMAP: '#84cc16', // Vert lime
  "Entreprise d'insertion": '#3b82f6', // Bleu secondary
  'Point de collecte': '#8b5cf6', // Violet
  Recyclerie: '#059669', // Vert foncé
  'Épicerie sociale': '#dc2626', // Rouge
  'Jardin partagé': '#65a30d', // Vert nature
  'Fab Lab': '#7c3aed', // Violet tech
  Coopérative: '#0891b2', // Bleu cyan
  'Monnaie locale': '#ca8a04', // Jaune doré
  'Tiers-lieu': '#9333ea', // Violet moderne
  Autre: '#6b7280', // Gris neutre
} as const;

/**
 * Gradients Tailwind for initiative type badges
 * Used in React components (FilterPanel, InitiativeCard)
 */
export const TYPE_GRADIENTS: Record<InitiativeType, string> = {
  Ressourcerie: 'from-slate-400 to-gray-600', // Gray - Recycling
  'Repair Café': 'from-amber-400 to-orange-600', // Orange - Repair/Fix
  AMAP: 'from-emerald-400 to-green-600', // Green - Food/Agriculture
  "Entreprise d'insertion": 'from-blue-400 to-indigo-600', // Blue - Social
  'Point de collecte': 'from-purple-400 to-violet-600', // Purple - Collection
  Recyclerie: 'from-teal-400 to-cyan-600', // Cyan - Recycling center
  'Épicerie sociale': 'from-rose-400 to-pink-600', // Pink - Social grocery
  'Jardin partagé': 'from-lime-400 to-green-600', // Lime - Gardens
  'Fab Lab': 'from-violet-400 to-purple-600', // Violet - Tech/Making
  Coopérative: 'from-sky-400 to-blue-600', // Sky blue - Cooperative
  'Monnaie locale': 'from-yellow-400 to-amber-600', // Yellow - Currency
  'Tiers-lieu': 'from-fuchsia-400 to-pink-600', // Fuchsia - Third place
  Autre: 'from-gray-400 to-slate-600', // Gray - Other
} as const;

/**
 * CSS Gradients for HTML inline styles (Map popups)
 * MUST match the Tailwind gradients above
 */
export const TYPE_GRADIENTS_CSS: Record<InitiativeType, string> = {
  Ressourcerie: 'linear-gradient(135deg, #94a3b8 0%, #4b5563 100%)', // slate-400 to gray-600
  'Repair Café': 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)', // amber-400 to orange-600
  AMAP: 'linear-gradient(135deg, #34d399 0%, #16a34a 100%)', // emerald-400 to green-600
  "Entreprise d'insertion": 'linear-gradient(135deg, #60a5fa 0%, #4f46e5 100%)', // blue-400 to indigo-600
  'Point de collecte': 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', // purple-400 to violet-600
  Recyclerie: 'linear-gradient(135deg, #2dd4bf 0%, #0891b2 100%)', // teal-400 to cyan-600
  'Épicerie sociale': 'linear-gradient(135deg, #fb7185 0%, #db2777 100%)', // rose-400 to pink-600
  'Jardin partagé': 'linear-gradient(135deg, #a3e635 0%, #16a34a 100%)', // lime-400 to green-600
  'Fab Lab': 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', // violet-400 to purple-600
  Coopérative: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', // sky-400 to blue-600
  'Monnaie locale': 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)', // yellow-400 to amber-600
  'Tiers-lieu': 'linear-gradient(135deg, #e879f9 0%, #db2777 100%)', // fuchsia-400 to pink-600
  Autre: 'linear-gradient(135deg, #9ca3af 0%, #64748b 100%)', // gray-400 to slate-600
} as const;

/**
 * Main colors for map markers - EXACT Tailwind colors from FilterPanel gradients
 * Using the START color (-400) of each gradient for vibrant appearance
 * These match EXACTLY what users see in the FilterPanel gradient dots
 */
export const TYPE_MARKER_COLORS: Record<InitiativeType, string> = {
  Ressourcerie: '#94a3b8', // slate-400 (from-slate-400 to-gray-600)
  'Repair Café': '#fbbf24', // amber-400 (from-amber-400 to-orange-600)
  AMAP: '#34d399', // emerald-400 (from-emerald-400 to-green-600)
  "Entreprise d'insertion": '#60a5fa', // blue-400 (from-blue-400 to-indigo-600)
  'Point de collecte': '#c084fc', // purple-400 (from-purple-400 to-violet-600)
  Recyclerie: '#2dd4bf', // teal-400 (from-teal-400 to-cyan-600)
  'Épicerie sociale': '#fb7185', // rose-400 (from-rose-400 to-pink-600)
  'Jardin partagé': '#a3e635', // lime-400 (from-lime-400 to-green-600)
  'Fab Lab': '#a78bfa', // violet-400 (from-violet-400 to-purple-600)
  Coopérative: '#38bdf8', // sky-400 (from-sky-400 to-blue-600)
  'Monnaie locale': '#facc15', // yellow-400 (from-yellow-400 to-amber-600)
  'Tiers-lieu': '#e879f9', // fuchsia-400 (from-fuchsia-400 to-pink-600)
  Autre: '#9ca3af', // gray-400 (from-gray-400 to-slate-600)
} as const;

/**
 * Icônes associées aux types d'initiatives (classes Lucide React)
 */
export const INITIATIVE_ICONS: Record<InitiativeType, string> = {
  Ressourcerie: 'Recycle',
  'Repair Café': 'Wrench',
  AMAP: 'Wheat',
  "Entreprise d'insertion": 'Building2',
  'Point de collecte': 'Trash2',
  Recyclerie: 'RefreshCw',
  'Épicerie sociale': 'ShoppingCart',
  'Jardin partagé': 'Flower2',
  'Fab Lab': 'Cpu',
  Coopérative: 'Users',
  'Monnaie locale': 'Coins',
  'Tiers-lieu': 'Coffee',
  Autre: 'MapPin',
} as const;

// ================================
// TYPES POUR LES ERREURS
// ================================

/**
 * Codes d'erreur spécifiques à LaMap
 */
export enum ErrorCode {
  // Erreurs génériques
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Erreurs d'authentification
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Erreurs de données
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Erreurs géographiques
  GEOCODING_FAILED = 'GEOCODING_FAILED',
  INVALID_COORDINATES = 'INVALID_COORDINATES',

  // Erreurs Mapbox
  MAPBOX_TOKEN_INVALID = 'MAPBOX_TOKEN_INVALID',
  MAPBOX_RATE_LIMIT = 'MAPBOX_RATE_LIMIT',

  // Erreurs Supabase
  SUPABASE_CONNECTION_ERROR = 'SUPABASE_CONNECTION_ERROR',
  RLS_POLICY_VIOLATION = 'RLS_POLICY_VIOLATION',
}

/**
 * Erreur personnalisée pour LaMap
 */
export class LaMapError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LaMapError';
  }
}

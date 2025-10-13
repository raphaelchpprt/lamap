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

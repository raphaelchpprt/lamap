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

  /** Réseaux sociaux */
  social_media?: SocialMedia;

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
 * Basé sur l'écosystème ESS français et l'économie circulaire
 */
export type InitiativeType =
  | 'Ressourcerie' // Collecte, tri, remise en état et vente d'objets
  | 'Recyclerie' // Centres de recyclage et valorisation
  | 'Repair Café' // Ateliers de réparation collaboratifs
  | 'Atelier vélo' // Ateliers vélo participatifs et vélo-écoles
  | 'Point de collecte' // Points de collecte de déchets spécialisés
  | 'Composteur collectif' // Composteurs de quartier et compostage partagé
  | 'AMAP' // Association pour le Maintien d'une Agriculture Paysanne
  | 'Jardin partagé' // Espaces de jardinage collectif
  | 'Grainothèque' // Échange et partage de graines
  | 'Friperie' // Vêtements de seconde main
  | 'Donnerie' // Don et récupération d'objets
  | 'Épicerie sociale' // Magasins solidaires à prix réduits
  | 'Épicerie vrac' // Épiceries en vrac et zéro déchet
  | "Bibliothèque d'objets" // Prêt d'outils et objets
  | 'SEL' // Système d'Échange Local
  | 'Accorderie' // Échange de services et de temps
  | 'Fab Lab' // Laboratoires de fabrication numérique
  | 'Coopérative' // Structures coopératives diverses
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

/**
 * Liens vers les réseaux sociaux
 */
export interface SocialMedia {
  /** Page ou profil Facebook */
  facebook?: string;
  /** Profil Instagram */
  instagram?: string;
  /** Profil Twitter/X */
  twitter?: string;
  /** Profil ou page LinkedIn */
  linkedin?: string;
  /** Chaîne YouTube */
  youtube?: string;
  /** Profil TikTok */
  tiktok?: string;
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
  Recyclerie: '#059669', // Vert foncé
  'Repair Café': '#f59e0b', // Orange accent
  'Atelier vélo': '#0891b2', // Cyan - vélo
  'Point de collecte': '#8b5cf6', // Violet
  'Composteur collectif': '#65a30d', // Vert compost
  AMAP: '#84cc16', // Vert lime
  'Jardin partagé': '#22c55e', // Vert nature
  Grainothèque: '#a3e635', // Vert lime clair
  Friperie: '#ec4899', // Rose - mode
  Donnerie: '#f472b6', // Rose clair
  'Épicerie sociale': '#dc2626', // Rouge
  'Épicerie vrac': '#eab308', // Jaune
  "Bibliothèque d'objets": '#6366f1', // Indigo - prêt
  SEL: '#ca8a04', // Jaune doré - échange
  Accorderie: '#06b6d4', // Cyan - services
  'Fab Lab': '#7c3aed', // Violet tech
  Coopérative: '#3b82f6', // Bleu
  'Tiers-lieu': '#9333ea', // Violet moderne
  Autre: '#6b7280', // Gris neutre
} as const;

/**
 * Gradients Tailwind for initiative type badges
 * Used in React components (FilterPanel, InitiativeCard)
 */
export const TYPE_GRADIENTS: Record<InitiativeType, string> = {
  Ressourcerie: 'from-slate-400 to-gray-600', // Gray - Recycling
  Recyclerie: 'from-teal-400 to-cyan-600', // Cyan - Recycling center
  'Repair Café': 'from-amber-400 to-orange-600', // Orange - Repair/Fix
  'Atelier vélo': 'from-cyan-400 to-sky-600', // Cyan - Bike
  'Point de collecte': 'from-purple-400 to-violet-600', // Purple - Collection
  'Composteur collectif': 'from-lime-600 to-green-700', // Dark green - Compost
  AMAP: 'from-emerald-400 to-green-600', // Green - Food/Agriculture
  'Jardin partagé': 'from-green-400 to-emerald-600', // Green - Gardens
  Grainothèque: 'from-lime-400 to-green-500', // Lime - Seeds
  Friperie: 'from-pink-400 to-rose-600', // Pink - Fashion
  Donnerie: 'from-rose-300 to-pink-500', // Light pink - Giving
  'Épicerie sociale': 'from-rose-400 to-red-600', // Red - Social grocery
  'Épicerie vrac': 'from-yellow-400 to-amber-600', // Yellow - Bulk
  "Bibliothèque d'objets": 'from-indigo-400 to-blue-600', // Indigo - Library
  SEL: 'from-amber-400 to-yellow-600', // Yellow/Amber - Exchange
  Accorderie: 'from-sky-400 to-cyan-600', // Sky - Services
  'Fab Lab': 'from-violet-400 to-purple-600', // Violet - Tech/Making
  Coopérative: 'from-blue-400 to-indigo-600', // Blue - Cooperative
  'Tiers-lieu': 'from-fuchsia-400 to-pink-600', // Fuchsia - Third place
  Autre: 'from-gray-400 to-slate-600', // Gray - Other
} as const;

/**
 * CSS Gradients for HTML inline styles (Map popups)
 * MUST match the Tailwind gradients above
 */
export const TYPE_GRADIENTS_CSS: Record<InitiativeType, string> = {
  Ressourcerie: 'linear-gradient(135deg, #94a3b8 0%, #4b5563 100%)', // slate-400 to gray-600
  Recyclerie: 'linear-gradient(135deg, #2dd4bf 0%, #0891b2 100%)', // teal-400 to cyan-600
  'Repair Café': 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)', // amber-400 to orange-600
  'Atelier vélo': 'linear-gradient(135deg, #22d3ee 0%, #0284c7 100%)', // cyan-400 to sky-600
  'Point de collecte': 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)', // purple-400 to violet-600
  'Composteur collectif': 'linear-gradient(135deg, #65a30d 0%, #15803d 100%)', // lime-600 to green-700
  AMAP: 'linear-gradient(135deg, #34d399 0%, #16a34a 100%)', // emerald-400 to green-600
  'Jardin partagé': 'linear-gradient(135deg, #4ade80 0%, #059669 100%)', // green-400 to emerald-600
  Grainothèque: 'linear-gradient(135deg, #a3e635 0%, #22c55e 100%)', // lime-400 to green-500
  Friperie: 'linear-gradient(135deg, #f472b6 0%, #e11d48 100%)', // pink-400 to rose-600
  Donnerie: 'linear-gradient(135deg, #fda4af 0%, #ec4899 100%)', // rose-300 to pink-500
  'Épicerie sociale': 'linear-gradient(135deg, #fb7185 0%, #dc2626 100%)', // rose-400 to red-600
  'Épicerie vrac': 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)', // yellow-400 to amber-600
  "Bibliothèque d'objets": 'linear-gradient(135deg, #818cf8 0%, #2563eb 100%)', // indigo-400 to blue-600
  SEL: 'linear-gradient(135deg, #fbbf24 0%, #ca8a04 100%)', // amber-400 to yellow-600
  Accorderie: 'linear-gradient(135deg, #38bdf8 0%, #0891b2 100%)', // sky-400 to cyan-600
  'Fab Lab': 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', // violet-400 to purple-600
  Coopérative: 'linear-gradient(135deg, #60a5fa 0%, #4f46e5 100%)', // blue-400 to indigo-600
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
  Recyclerie: '#2dd4bf', // teal-400 (from-teal-400 to-cyan-600)
  'Repair Café': '#fbbf24', // amber-400 (from-amber-400 to-orange-600)
  'Atelier vélo': '#22d3ee', // cyan-400 (from-cyan-400 to-sky-600)
  'Point de collecte': '#c084fc', // purple-400 (from-purple-400 to-violet-600)
  'Composteur collectif': '#65a30d', // lime-600 (from-lime-600 to-green-700)
  AMAP: '#34d399', // emerald-400 (from-emerald-400 to-green-600)
  'Jardin partagé': '#4ade80', // green-400 (from-green-400 to-emerald-600)
  Grainothèque: '#a3e635', // lime-400 (from-lime-400 to-green-500)
  Friperie: '#f472b6', // pink-400 (from-pink-400 to-rose-600)
  Donnerie: '#fda4af', // rose-300 (from-rose-300 to-pink-500)
  'Épicerie sociale': '#fb7185', // rose-400 (from-rose-400 to-red-600)
  'Épicerie vrac': '#facc15', // yellow-400 (from-yellow-400 to-amber-600)
  "Bibliothèque d'objets": '#818cf8', // indigo-400 (from-indigo-400 to-blue-600)
  SEL: '#fbbf24', // amber-400 (from-amber-400 to-yellow-600)
  Accorderie: '#38bdf8', // sky-400 (from-sky-400 to-cyan-600)
  'Fab Lab': '#a78bfa', // violet-400 (from-violet-400 to-purple-600)
  Coopérative: '#60a5fa', // blue-400 (from-blue-400 to-indigo-600)
  'Tiers-lieu': '#e879f9', // fuchsia-400 (from-fuchsia-400 to-pink-600)
  Autre: '#9ca3af', // gray-400 (from-gray-400 to-slate-600)
} as const;

/**
 * Icônes associées aux types d'initiatives (classes Lucide React)
 */
export const INITIATIVE_ICONS: Record<InitiativeType, string> = {
  Ressourcerie: 'Recycle',
  Recyclerie: 'RefreshCw',
  'Repair Café': 'Wrench',
  'Atelier vélo': 'Bike',
  'Point de collecte': 'Trash2',
  'Composteur collectif': 'Leaf',
  AMAP: 'Wheat',
  'Jardin partagé': 'Flower2',
  Grainothèque: 'Sprout',
  Friperie: 'Shirt',
  Donnerie: 'Gift',
  'Épicerie sociale': 'ShoppingCart',
  'Épicerie vrac': 'ShoppingBag',
  "Bibliothèque d'objets": 'LibraryBig',
  SEL: 'Handshake',
  Accorderie: 'Users',
  'Fab Lab': 'Cpu',
  Coopérative: 'Building2',
  'Tiers-lieu': 'Coffee',
  Autre: 'MapPin',
} as const;

/**
 * Descriptions détaillées de chaque type d'initiative
 * Utilisées pour les tooltips et pages d'information
 */
export const INITIATIVE_DESCRIPTIONS: Record<InitiativeType, string> = {
  Ressourcerie:
    'Lieu de collecte, tri, valorisation et revente d\'objets de seconde main. Favorise le réemploi et évite le gaspillage en donnant une seconde vie aux objets.',
  Recyclerie:
    'Centre de recyclage et de valorisation des déchets. Transforme les matériaux usagés en nouvelles ressources pour l\'économie circulaire.',
  'Repair Café':
    'Atelier participatif où l\'on apprend à réparer ses objets (électroménager, vêtements, vélos...). Lutter contre l\'obsolescence programmée et créer du lien social.',
  'Atelier vélo':
    'Atelier associatif d\'auto-réparation de vélos. Apprendre à entretenir et réparer son vélo, avec outils et conseils de bénévoles. Favorise la mobilité douce.',
  'Point de collecte':
    'Point de collecte pour déchets spécifiques (textiles, piles, électronique, etc.). Permet un recyclage approprié et évite la pollution.',
  'Composteur collectif':
    'Composteur de quartier où habitants déposent leurs déchets organiques. Produit du compost gratuit et réduit les ordures ménagères de 30%.',
  AMAP:
    'Association pour le Maintien d\'une Agriculture Paysanne. Circuit court entre producteurs et consommateurs avec engagement réciproque. Produits locaux, de saison et bio.',
  'Jardin partagé':
    'Espace de jardinage collectif géré par les habitants. Cultiver ses légumes, apprendre le jardinage écologique et créer du lien social dans le quartier.',
  Grainothèque:
    'Lieu d\'échange gratuit de graines et de savoir-faire. Préserver la biodiversité végétale et partager les semences libres entre jardiniers amateurs.',
  Friperie:
    'Magasin de vêtements et accessoires de seconde main. Alternative durable à la fast-fashion, favorise le réemploi textile et l\'économie circulaire.',
  Donnerie:
    'Lieu de don et de récupération d\'objets gratuits. Principe du "gratuit" pour éviter le gaspillage et permettre l\'accès à tous aux biens de consommation.',
  'Épicerie sociale':
    'Magasin solidaire proposant des produits alimentaires à prix réduits. Aide les personnes en difficulté tout en préservant leur dignité et leur pouvoir d\'achat.',
  'Épicerie vrac':
    'Épicerie zéro déchet vendant en vrac (sans emballage). Réduire les déchets plastiques, acheter la quantité souhaitée et privilégier le local et le bio.',
  "Bibliothèque d'objets":
    'Lieu de prêt d\'outils et d\'objets du quotidien (perceuse, échelle, appareil à raclette...). Usage plutôt que propriété, économie de partage.',
  SEL:
    'Système d\'Échange Local basé sur l\'échange de services, savoirs et biens sans argent. Monnaie locale virtuelle et création de lien social dans le territoire.',
  Accorderie:
    'Réseau d\'échange de services et de temps entre membres. Une heure donnée = une heure reçue, quelle que soit la nature du service. Égalité et solidarité.',
  'Fab Lab':
    'Laboratoire de fabrication numérique ouvert à tous. Machines (imprimante 3D, découpe laser...), partage de connaissances et prototypage de projets.',
  Coopérative:
    'Entreprise collective où les membres sont propriétaires et décisionnaires. Gouvernance démocratique, partage des bénéfices et ancrage territorial.',
  'Tiers-lieu':
    'Espace hybride entre domicile et travail. Coworking, fablab, café associatif... Favorise innovation sociale, collaboration et convivialité.',
  Autre:
    'Autre initiative d\'économie sociale, solidaire et circulaire ne correspondant pas aux catégories existantes.',
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

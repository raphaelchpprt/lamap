/**
 * Types générés pour la base de données Supabase LaMap
 *
 * Ces types sont générés automatiquement à partir du schéma de base de données.
 * Ils garantissent la cohérence entre le frontend TypeScript et la base PostgreSQL.
 *
 * Pour régénérer ces types après modification du schéma :
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/lib/supabase/types.ts
 */

import type {
  Initiative,
  InitiativeType,
  OpeningHours,
} from '@/types/initiative';

// ================================
// TYPES DE BASE DE DONNÉES
// ================================

/**
 * Structure principale de la base de données LaMap
 */
export interface Database {
  public: {
    Tables: {
      // Table des initiatives ESS
      initiatives: {
        Row: DatabaseInitiative;
        Insert: DatabaseInitiativeInsert;
        Update: DatabaseInitiativeUpdate;
      };

      // Tables futures (à ajouter selon les besoins)
      users_profiles?: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };

      comments?: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
    };
    Views: {
      // Vues utiles pour les requêtes
      initiatives_with_distance?: {
        Row: InitiativeWithDistance;
      };
    };
    Functions: {
      // Fonctions PostgreSQL/PostGIS personnalisées
      get_nearby_initiatives: {
        Args: {
          lat: number;
          lng: number;
          radius_km?: number;
        };
        Returns: InitiativeWithDistance[];
      };

      get_initiatives_in_bounds: {
        Args: {
          p_west: number;
          p_south: number;
          p_east: number;
          p_north: number;
          p_types?: string[] | null;
          p_verified_only?: boolean;
          p_limit?: number;
        };
        Returns: DatabaseInitiative[];
      };
    };
    Enums: {
      initiative_type: InitiativeType;
    };
  };
}

// ================================
// TYPES POUR LA TABLE INITIATIVES
// ================================

/**
 * Structure de la table initiatives telle qu'elle existe en base
 */
export interface DatabaseInitiative {
  /** UUID généré automatiquement */
  id: string;

  /** Nom de l'initiative (NOT NULL) */
  name: string;

  /** Type d'initiative (enum) */
  type: InitiativeType;

  /** Description optionnelle */
  description: string | null;

  /** Adresse textuelle */
  address: string | null;

  /** Point géographique PostGIS (format WKT: 'POINT(lng lat)') */
  location: string;

  /** Statut de vérification */
  verified: boolean;

  /** URL de l'image */
  image_url: string | null;

  /** Site web */
  website: string | null;

  /** Téléphone */
  phone: string | null;

  /** Email */
  email: string | null;

  /** Horaires (JSONB) */
  opening_hours: OpeningHours | null;

  /** ID de l'utilisateur créateur */
  user_id: string | null;

  /** Date de création */
  created_at: string;

  /** Date de modification */
  updated_at: string;
}

/**
 * Type pour l'insertion en base (certains champs sont optionnels)
 */
export interface DatabaseInitiativeInsert {
  id?: string;
  name: string;
  type: InitiativeType;
  description?: string | null;
  address?: string | null;
  location: string; // Format PostGIS: 'POINT(longitude latitude)'
  verified?: boolean;
  image_url?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  opening_hours?: OpeningHours | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type pour la mise à jour en base (tous les champs optionnels)
 */
export interface DatabaseInitiativeUpdate {
  id?: string;
  name?: string;
  type?: InitiativeType;
  description?: string | null;
  address?: string | null;
  location?: string;
  verified?: boolean;
  image_url?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  opening_hours?: OpeningHours | null;
  user_id?: string | null;
  updated_at?: string;
}

// ================================
// TYPES POUR LES VUES ET FONCTIONS
// ================================

/**
 * Initiative with distance calculée (pour les recherches géographiques)
 */
export interface InitiativeWithDistance extends DatabaseInitiative {
  /** Distance en mètres depuis le point de référence */
  distance_meters: number;

  /** Distance en kilomètres (calculée) */
  distance_km: number;
}

/**
 * Database initiative with location as text (from RPC functions)
 */
export interface DatabaseInitiativeWithTextLocation
  extends Omit<DatabaseInitiative, 'location'> {
  location_text: string;
}

// ================================
// TYPES POUR LES PROFILS UTILISATEUR (FUTUR)
// ================================

/**
 * Profil utilisateur étendu (table séparée de auth.users)
 */
export interface UserProfile {
  id: string;
  user_id: string; // Référence vers auth.users
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  is_moderator: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id?: string;
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  is_moderator?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  is_moderator?: boolean;
  updated_at?: string;
}

// ================================
// TYPES POUR LES COMMENTAIRES (FUTUR)
// ================================

/**
 * Commentaire sur une initiative
 */
export interface Comment {
  id: string;
  initiative_id: string;
  user_id: string;
  content: string;
  rating: number | null; // Note de 1 à 5
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentInsert {
  id?: string;
  initiative_id: string;
  user_id: string;
  content: string;
  rating?: number | null;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CommentUpdate {
  content?: string;
  rating?: number | null;
  is_public?: boolean;
  updated_at?: string;
}

// ================================
// CONVERSION UTILITIES
// ================================

/**
 * Parse PostGIS location (handles both WKT text and WKB binary formats)
 */
function parsePostGISLocation(location: string): [number, number] {
  // Check if it's WKT text format: "POINT(lng lat)"
  const textMatch = location.match(/POINT\(([^)]+)\)/);
  if (textMatch) {
    const [lng, lat] = textMatch[1].split(' ').map(Number);
    return [lng, lat];
  }

  // If it's WKB binary format (hex string starting with 01010000...)
  // We need to use a SQL query to convert it
  // For now, throw a helpful error
  if (location.startsWith('0101000020')) {
    throw new Error(
      'Location is in WKB binary format. Need to use ST_AsText() in SQL query. ' +
        'Please update the Supabase query to: select(*, location_text:ST_AsText(location))'
    );
  }

  throw new Error(`Invalid location format: ${location}`);
}

/**
 * Convert initiative from database format to frontend format
 */
export function databaseInitiativeToInitiative(
  dbInitiative: DatabaseInitiative | DatabaseInitiativeWithTextLocation
): Initiative {
  // Handle both location and location_text fields
  const locationField =
    'location_text' in dbInitiative
      ? dbInitiative.location_text
      : dbInitiative.location;

  if (!locationField) {
    throw new Error('Initiative missing location data');
  }

  // Parse PostGIS point to GeoJSON
  const [lng, lat] = parsePostGISLocation(locationField);

  return {
    id: dbInitiative.id,
    name: dbInitiative.name,
    type: dbInitiative.type,
    description: dbInitiative.description || undefined,
    address: dbInitiative.address || undefined,
    location: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    verified: dbInitiative.verified,
    image_url: dbInitiative.image_url || undefined,
    website: dbInitiative.website || undefined,
    phone: dbInitiative.phone || undefined,
    email: dbInitiative.email || undefined,
    opening_hours: dbInitiative.opening_hours || undefined,
    user_id: dbInitiative.user_id || undefined,
    created_at: dbInitiative.created_at,
    updated_at: dbInitiative.updated_at,
  };
}

/**
 * Convert initiative from frontend format to database format
 */
export function initiativeToDatabaseInitiative(
  initiative: Partial<Initiative>
): DatabaseInitiativeInsert {
  const location = initiative.location
    ? `POINT(${initiative.location.coordinates[0]} ${initiative.location.coordinates[1]})`
    : undefined;

  return {
    id: initiative.id,
    name: initiative.name ?? '',
    type: initiative.type ?? 'Autre',
    description: initiative.description || null,
    address: initiative.address || null,
    location: location ?? 'POINT(0 0)',
    verified: initiative.verified ?? false,
    image_url: initiative.image_url || null,
    website: initiative.website || null,
    phone: initiative.phone || null,
    email: initiative.email || null,
    opening_hours: initiative.opening_hours || null,
    user_id: initiative.user_id || null,
  };
}

// ================================
// TYPES POUR LES REQUÊTES RPC
// ================================

/**
 * Paramètres pour la fonction get_nearby_initiatives
 */
export interface GetNearbyInitiativesParams {
  lat: number;
  lng: number;
  radius_km?: number;
}

/**
 * Paramètres pour la fonction get_initiatives_in_bounds
 */
export interface GetInitiativesInBoundsParams {
  min_lat: number;
  min_lng: number;
  max_lat: number;
  max_lng: number;
}

// ================================
// TYPES D'ERREUR SUPABASE
// ================================

/**
 * Erreur Supabase typée
 */
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Réponse Supabase avec gestion d'erreur
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

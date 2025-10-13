/**
 * Supabase client for browser (Client Components)
 *
 * This client is used in React components that run on the client side.
 * It automatically manages authentication and user sessions.
 */

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

/**
 * Crée ou retourne le client Supabase pour le navigateur
 *
 * Utilise un singleton pour éviter de créer plusieurs instances
 * et optimiser les performances.
 *
 * @returns Client Supabase configuré pour le navigateur
 */
export function createClient() {
  // Vérification des variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variables d'environnement Supabase manquantes. " +
        'Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
    );
  }

  // Utilisation du singleton pour éviter les recréations
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return supabaseClient;
}

/**
 * Hook pour utiliser le client Supabase dans les composants React
 *
 * @returns Client Supabase typé avec la base de données LaMap
 */
export function useSupabase() {
  return createClient();
}

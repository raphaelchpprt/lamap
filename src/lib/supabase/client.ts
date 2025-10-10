/**
 * Client Supabase pour le navigateur (Client Components)
 * 
 * Ce client est utilisé dans les composants React qui s'exécutent côté client.
 * Il gère automatiquement l'authentification et les sessions utilisateur.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variables d\'environnement Supabase manquantes. ' +
      'Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
    )
  }

  // Utilisation du singleton pour éviter les recréations
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    )
  }

  return supabaseClient
}

/**
 * Hook pour utiliser le client Supabase dans les composants React
 * 
 * @returns Client Supabase typé avec la base de données LaMap
 */
export function useSupabase() {
  return createClient()
}
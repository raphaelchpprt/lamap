/**
 * Client Supabase pour le serveur (Server Components et API Routes)
 * 
 * Ce client est utilisé dans les Server Components Next.js et les API Routes.
 * Il gère les cookies pour maintenir l'état d'authentification côté serveur.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Crée le client Supabase pour les Server Components
 * 
 * Utilise les cookies Next.js pour gérer l'authentification côté serveur.
 * Cette fonction doit être appelée dans un contexte async.
 * 
 * @returns Client Supabase configuré pour le serveur
 */
export async function createClient() {
  // Vérification des variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variables d\'environnement Supabase manquantes. ' +
      'Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
    )
  }

  // Récupération du store de cookies Next.js
  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Récupère tous les cookies
        getAll() {
          return cookieStore.getAll()
        },
        // Définit plusieurs cookies à la fois
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Les erreurs de cookies peuvent être ignorées dans certains contextes
            // (par exemple, lors du rendu côté serveur)
            console.warn('Impossible de définir les cookies:', error)
          }
        },
      },
    }
  )
}

/**
 * Crée le client Supabase pour les API Routes
 * 
 * Version spécialisée pour les API Routes qui ont besoin d'un contrôle
 * plus fin sur les cookies.
 * 
 * @param request - Objet Request de l'API Route
 * @param response - Objet Response de l'API Route  
 * @returns Client Supabase configuré pour les API Routes
 */
export function createClientForApiRoute(
  request: Request,
  response?: Response
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variables d\'environnement Supabase manquantes. ' +
      'Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local'
    )
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          // Récupère les cookies depuis la requête
          const cookieHeader = request.headers.get('cookie')
          if (!cookieHeader) return []
          
          return cookieHeader
            .split(';')
            .map(cookie => {
              const [name, ...rest] = cookie.trim().split('=')
              return {
                name: name?.trim() || '',
                value: rest.join('=') || ''
              }
            })
            .filter(cookie => cookie.name && cookie.value)
        },
        setAll(cookiesToSet) {
          // Définit les cookies dans la réponse si disponible
          if (response) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.headers.append(
                'Set-Cookie',
                `${name}=${value}; ${Object.entries(options || {})
                  .map(([key, val]) => `${key}=${val}`)
                  .join('; ')}`
              )
            })
          }
        },
      },
    }
  )
}
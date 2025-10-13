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
 * Create or return the Supabase client for browser
 *
 * Uses a singleton pattern to avoid creating multiple instances
 * and optimize performance.
 *
 * @returns Supabase client configured for browser
 */
export function createClient() {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  // Use singleton to avoid recreations
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  }

  return supabaseClient;
}

/**
 * Hook to use Supabase client in React components
 *
 * @returns Supabase client typed with LaMap database
 */
export function useSupabase() {
  return createClient();
}

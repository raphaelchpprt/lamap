/**
 * Supabase client for server (Server Components and API Routes)
 *
 * This client is used in Next.js Server Components and API Routes.
 * It manages cookies to maintain authentication state on the server side.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from './types';

/**
 * Create Supabase client for Server Components
 *
 * Uses Next.js cookies to manage server-side authentication.
 * This function must be called in an async context.
 *
 * @returns Supabase client configured for server
 */
export async function createClient() {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  // Get Next.js cookie store
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Get all cookies
      getAll() {
        return cookieStore.getAll();
      },
      // Set multiple cookies at once
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Cookie errors can be ignored in some contexts
          // (e.g., during server-side rendering)
          console.warn('Unable to set cookies:', error);
        }
      },
    },
  });
}

/**
 * Create Supabase client for API Routes
 *
 * Specialized version for API Routes that need finer control
 * over cookies.
 *
 * @param request - API Route Request object
 * @param response - API Route Response object
 * @returns Supabase client configured for API Routes
 */
export function createClientForApiRoute(request: Request, response?: Response) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Get cookies from request
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) return [];

        return cookieHeader
          .split(';')
          .map((cookie) => {
            const [name, ...rest] = cookie.trim().split('=');
            return {
              name: name?.trim() || '',
              value: rest.join('=') || '',
            };
          })
          .filter((cookie) => cookie.name && cookie.value);
      },
      setAll(cookiesToSet) {
        // Set cookies in response if available
        if (response) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.headers.append(
              'Set-Cookie',
              `${name}=${value}; ${Object.entries(options || {})
                .map(([key, val]) => `${key}=${val}`)
                .join('; ')}`
            );
          });
        }
      },
    },
  });
}

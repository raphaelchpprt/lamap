/**
 * Mock setup for Supabase modules
 * This file provides a centralized mock configuration for all Supabase imports
 */

// Mock Supabase browser client
export const mockSupabaseBrowserClient: any = {
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    ),
    getSession: jest.fn(() =>
      Promise.resolve({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' },
            access_token: 'test-token',
          },
        },
        error: null,
      })
    ),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => mockSupabaseBrowserClient),
  select: jest.fn(() => mockSupabaseBrowserClient),
  insert: jest.fn(() => mockSupabaseBrowserClient),
  update: jest.fn(() => mockSupabaseBrowserClient),
  delete: jest.fn(() => mockSupabaseBrowserClient),
  eq: jest.fn(() => mockSupabaseBrowserClient),
  single: jest.fn(() =>
    Promise.resolve({
      data: null,
      error: null,
    })
  ),
  // Add more methods as needed
};

// Mock Supabase server client
export const mockSupabaseServerClient: any = {
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    ),
    getSession: jest.fn(() =>
      Promise.resolve({
        data: {
          session: {
            user: { id: 'test-user-id', email: 'test@example.com' },
            access_token: 'test-token',
          },
        },
        error: null,
      })
    ),
  },
  from: jest.fn(() => mockSupabaseServerClient),
  select: jest.fn(() => mockSupabaseServerClient),
  insert: jest.fn(() => mockSupabaseServerClient),
  update: jest.fn(() => mockSupabaseServerClient),
  delete: jest.fn(() => mockSupabaseServerClient),
  eq: jest.fn(() => mockSupabaseServerClient),
  single: jest.fn(() =>
    Promise.resolve({
      data: null,
      error: null,
    })
  ),
  // Add more methods as needed
};

// Export factory functions
export const createMockBrowserClient = () => mockSupabaseBrowserClient;
export const createMockServerClient = () =>
  Promise.resolve(mockSupabaseServerClient);

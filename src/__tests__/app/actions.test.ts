/**
 * Tests for Server Actions
 *
 * These tests verify the CRUD operations for initiatives,
 * including validation, authentication, and authorization.
 */

import { revalidatePath } from 'next/cache';

import {
  createInitiative,
  deleteInitiative,
  getInitiativeById,
  updateInitiative,
  verifyInitiative,
} from '@/app/actions';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('next/cache');

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

describe('Server Actions', () => {
  // Mock Supabase client
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe('createInitiative', () => {
    const validData = {
      name: 'Test Initiative',
      type: 'AMAP' as const,
      description: 'A test initiative',
      address: '123 Test Street',
      latitude: 48.8566,
      longitude: 2.3522,
      website: 'https://test.com',
      phone: '0123456789',
      email: 'test@test.com',
    };

    it('should create an initiative successfully', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      // Mock successful insert
      mockSupabase.single.mockResolvedValue({
        data: { id: 'initiative123' },
        error: null,
      });

      const result = await createInitiative(validData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('initiative123');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    });

    it('should fail if user is not authenticated', async () => {
      // Mock unauthenticated
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await createInitiative(validData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('connecté');
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it('should validate name length (minimum 3 characters)', async () => {
      const result = await createInitiative({
        ...validData,
        name: 'AB', // Too short
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('3 caractères');
    });

    it('should validate latitude bounds (-90 to 90)', async () => {
      const result = await createInitiative({
        ...validData,
        latitude: 91, // Out of bounds
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Latitude');
    });

    it('should validate longitude bounds (-180 to 180)', async () => {
      const result = await createInitiative({
        ...validData,
        longitude: 181, // Out of bounds
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Longitude');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await createInitiative(validData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('updateInitiative', () => {
    const updateData = {
      name: 'Updated Initiative',
      description: 'Updated description',
    };

    it('should update an initiative successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      // Mock ownership check
      mockSupabase.single.mockResolvedValueOnce({
        data: { user_id: 'user123' },
        error: null,
      });

      // Mock successful update
      mockSupabase.eq.mockResolvedValue({
        error: null,
      });

      const result = await updateInitiative('initiative123', updateData);

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    });

    it('should fail if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateInitiative('initiative123', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('connecté');
    });

    it('should fail if user does not own the initiative', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      // Mock initiative owned by different user
      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'otherUser' },
        error: null,
      });

      const result = await updateInitiative('initiative123', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('autorisé');
    });

    it('should validate updated name length', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'user123' },
        error: null,
      });

      const result = await updateInitiative('initiative123', {
        name: 'AB', // Too short
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('3 caractères');
    });
  });

  describe('deleteInitiative', () => {
    it('should delete an initiative successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      // Mock ownership check
      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'user123' },
        error: null,
      });

      // Mock successful delete
      mockSupabase.eq.mockResolvedValue({
        error: null,
      });

      const result = await deleteInitiative('initiative123');

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    });

    it('should fail if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await deleteInitiative('initiative123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('connecté');
    });

    it('should fail if user does not own the initiative', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { user_id: 'otherUser' },
        error: null,
      });

      const result = await deleteInitiative('initiative123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('supprimer');
    });

    it('should fail if initiative does not exist', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await deleteInitiative('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('trouvée');
    });
  });

  describe('verifyInitiative', () => {
    it('should verify an initiative successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin123' } },
        error: null,
      });

      mockSupabase.eq.mockResolvedValue({
        error: null,
      });

      const result = await verifyInitiative('initiative123', true);

      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith('/');
    });

    it('should unverify an initiative successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin123' } },
        error: null,
      });

      mockSupabase.eq.mockResolvedValue({
        error: null,
      });

      const result = await verifyInitiative('initiative123', false);

      expect(result.success).toBe(true);
    });

    it('should fail if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await verifyInitiative('initiative123', true);

      expect(result.success).toBe(false);
      expect(result.error).toContain('connecté');
    });
  });

  describe('getInitiativeById', () => {
    it('should fetch an initiative successfully', async () => {
      const mockInitiative = {
        id: 'initiative123',
        name: 'Test Initiative',
        type: 'AMAP',
        description: 'A test',
        address: '123 Test St',
        website: 'https://test.com',
        phone: '0123456789',
        email: 'test@test.com',
        verified: true,
        created_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockInitiative,
        error: null,
      });

      const result = await getInitiativeById('initiative123');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('initiative123');
      expect(result.data?.name).toBe('Test Initiative');
    });

    it('should fail if initiative does not exist', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await getInitiativeById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('trouvée');
    });

    it('should validate ID format', async () => {
      const result = await getInitiativeById('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('valide');
    });
  });
});

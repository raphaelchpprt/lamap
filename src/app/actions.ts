// @ts-nocheck - Supabase types need to be generated. Run: npx supabase gen types typescript
'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

import type { InitiativeType } from '@/types/initiative';

// ================================
// TYPES
// ================================

interface CreateInitiativeData {
  name: string;
  type: InitiativeType;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  website?: string;
  phone?: string;
  email?: string;
}

interface UpdateInitiativeData {
  name?: string;
  type?: InitiativeType;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  phone?: string;
  email?: string;
  verified?: boolean;
}

interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ================================
// CREATE INITIATIVE
// ================================

export async function createInitiative(
  data: CreateInitiativeData
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validation
    if (!data.name || data.name.trim().length < 3) {
      return {
        success: false,
        error: 'Le nom doit contenir au moins 3 caractères',
      };
    }

    if (!data.type) {
      return {
        success: false,
        error: 'Le type est obligatoire',
      };
    }

    if (isNaN(data.latitude) || isNaN(data.longitude)) {
      return {
        success: false,
        error: 'Les coordonnées GPS sont invalides',
      };
    }

    if (
      data.latitude < -90 ||
      data.latitude > 90 ||
      data.longitude < -180 ||
      data.longitude > 180
    ) {
      return {
        success: false,
        error: 'Les coordonnées GPS sont hors limites',
      };
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté pour ajouter une initiative',
      };
    }

    // Create initiative with PostGIS POINT
    const { data: initiative, error: insertError } = (await supabase
      .from('initiatives')
      .insert({
        name: data.name.trim(),
        type: data.type,
        description: data.description?.trim() || null,
        address: data.address?.trim() || null,
        location: `POINT(${data.longitude} ${data.latitude})`,
        website: data.website?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        user_id: user.id,
        verified: false,
      })
      .select('id')
      .single()) as any;

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return {
        success: false,
        error: `Erreur lors de l'ajout: ${insertError.message}`,
      };
    }

    // Revalidate the homepage to show the new initiative
    revalidatePath('/');

    return {
      success: true,
      data: { id: initiative.id },
    };
  } catch (error) {
    console.error('Error creating initiative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }
}

// ================================
// UPDATE INITIATIVE
// ================================

export async function updateInitiative(
  id: string,
  data: UpdateInitiativeData
): Promise<ActionResponse> {
  try {
    if (!id) {
      return {
        success: false,
        error: "L'ID de l'initiative est requis",
      };
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté pour modifier une initiative',
      };
    }

    // Check if initiative exists and user owns it
    const { data: existing, error: fetchError } = (await supabase
      .from('initiatives')
      .select('user_id')
      .eq('id', id)
      .single()) as any;

    if (fetchError || !existing) {
      return {
        success: false,
        error: 'Initiative non trouvée',
      };
    }

    if (existing.user_id !== user.id) {
      return {
        success: false,
        error: "Vous n'êtes pas autorisé à modifier cette initiative",
      };
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      if (data.name.trim().length < 3) {
        return {
          success: false,
          error: 'Le nom doit contenir au moins 3 caractères',
        };
      }
      updateData.name = data.name.trim();
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    if (data.address !== undefined) {
      updateData.address = data.address?.trim() || null;
    }

    if (data.website !== undefined) {
      updateData.website = data.website?.trim() || null;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone?.trim() || null;
    }

    if (data.email !== undefined) {
      updateData.email = data.email?.trim() || null;
    }

    // Update location if both coordinates are provided
    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (isNaN(data.latitude) || isNaN(data.longitude)) {
        return {
          success: false,
          error: 'Les coordonnées GPS sont invalides',
        };
      }

      if (
        data.latitude < -90 ||
        data.latitude > 90 ||
        data.longitude < -180 ||
        data.longitude > 180
      ) {
        return {
          success: false,
          error: 'Les coordonnées GPS sont hors limites',
        };
      }

      updateData.location = `POINT(${data.longitude} ${data.latitude})`;
    }

    // Update initiative
    const { error: updateError } = (await supabase
      .from('initiatives')
      .update(updateData)
      .eq('id', id)) as any;

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return {
        success: false,
        error: `Erreur lors de la modification: ${updateError.message}`,
      };
    }

    // Revalidate the homepage
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating initiative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }
}

// ================================
// DELETE INITIATIVE
// ================================

export async function deleteInitiative(id: string): Promise<ActionResponse> {
  try {
    if (!id) {
      return {
        success: false,
        error: "L'ID de l'initiative est requis",
      };
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté pour supprimer une initiative',
      };
    }

    // Check if initiative exists and user owns it
    const { data: existing, error: fetchError } = (await supabase
      .from('initiatives')
      .select('user_id')
      .eq('id', id)
      .single()) as any;

    if (fetchError || !existing) {
      return {
        success: false,
        error: 'Initiative non trouvée',
      };
    }

    if (existing.user_id !== user.id) {
      return {
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer cette initiative",
      };
    }

    // Delete initiative
    const { error: deleteError } = (await supabase
      .from('initiatives')
      .delete()
      .eq('id', id)) as any;

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return {
        success: false,
        error: `Erreur lors de la suppression: ${deleteError.message}`,
      };
    }

    // Revalidate the homepage
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting initiative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }
}

// ================================
// VERIFY INITIATIVE (Admin only)
// ================================

export async function verifyInitiative(
  id: string,
  verified: boolean
): Promise<ActionResponse> {
  try {
    if (!id) {
      return {
        success: false,
        error: "L'ID de l'initiative est requis",
      };
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté',
      };
    }

    // TODO: Add admin role check here
    // For now, any authenticated user can verify
    // In production, check user role from profiles table

    // Update verification status
    const { error: updateError } = (await supabase
      .from('initiatives')
      .update({ verified })
      .eq('id', id)) as any;

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return {
        success: false,
        error: `Erreur lors de la vérification: ${updateError.message}`,
      };
    }

    // Revalidate the homepage
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error verifying initiative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }
}

// ================================
// GET INITIATIVE BY ID
// ================================

export async function getInitiativeById(id: string): Promise<
  ActionResponse<{
    id: string;
    name: string;
    type: InitiativeType;
    description: string | null;
    address: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
    verified: boolean;
    created_at: string;
  }>
> {
  try {
    if (!id) {
      return {
        success: false,
        error: "L'ID de l'initiative est requis",
      };
    }

    const supabase = await createClient();
    const { data, error } = (await supabase
      .from('initiatives')
      .select('*')
      .eq('id', id)
      .single()) as any;

    if (error || !data) {
      return {
        success: false,
        error: 'Initiative non trouvée',
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        description: data.description,
        address: data.address,
        website: data.website,
        phone: data.phone,
        email: data.email,
        verified: data.verified,
        created_at: data.created_at,
      },
    };
  } catch (error) {
    console.error('Error fetching initiative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }
}

'use client';

import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

import type { InitiativeType } from '@/types/initiative';

interface AddInitiativeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddInitiativeForm({
  onSuccess,
  onCancel,
}: AddInitiativeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiativeTypes: InitiativeType[] = [
    'Ressourcerie',
    'Repair Café',
    'AMAP',
    "Entreprise d'insertion",
    'Point de collecte',
    'Recyclerie',
    'Épicerie sociale',
    'Jardin partagé',
    'Fab Lab',
    'Coopérative',
    'Monnaie locale',
    'Tiers-lieu',
    'Autre',
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as InitiativeType;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const website = formData.get('website') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;

    if (!name || !type || isNaN(latitude) || isNaN(longitude)) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to add an initiative');
        setIsSubmitting(false);
        return;
      }

      // Create initiative with PostGIS POINT
      // @ts-expect-error - Supabase types need to be generated
      const { error: insertError } = await supabase.from('initiatives').insert({
        name,
        type,
        description: description || null,
        address: address || null,
        location: `POINT(${longitude} ${latitude})`,
        website: website || null,
        phone: phone || null,
        email: email || null,
        user_id: user.id,
      });

      if (insertError) throw insertError;

      // Reset form
      e.currentTarget.reset();
      onSuccess?.();
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-900">
        Ajouter une initiative
      </h2>

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Nom */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Initiative Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Ex: Ressourcerie de Belleville"
        />
      </div>

      {/* Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Initiative Type *
        </label>
        <select
          id="type"
          name="type"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Sélectionnez un type</option>
          {initiativeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Décrivez l'initiative..."
        />
      </div>

      {/* Adresse */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Adresse
        </label>
        <input
          type="text"
          id="address"
          name="address"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Ex: 12 rue de la Paix, 75002 Paris"
        />
      </div>

      {/* Coordonnées GPS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-gray-700"
          >
            Latitude *
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            step="0.000001"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Ex: 48.8566"
          />
        </div>
        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700"
          >
            Longitude *
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            step="0.000001"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Ex: 2.3522"
          />
        </div>
      </div>

      {/* Informations de contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Informations de contact
        </h3>

        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700"
          >
            Site web
          </label>
          <input
            type="url"
            id="website"
            name="website"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="https://exemple.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Téléphone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="01 23 45 67 89"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="contact@exemple.com"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Ajout en cours...' : "Ajouter l'initiative"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

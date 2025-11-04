'use client';

import { useRef, useState } from 'react';

import { createInitiative } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { InitiativeType } from '@/types/initiative';

interface AddInitiativeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddInitiativeForm({
  onSuccess,
  onCancel,
}: AddInitiativeFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiativeTypes: InitiativeType[] = [
    'Ressourcerie',
    'Recyclerie',
    'Repair Café',
    'Atelier vélo',
    'Point de collecte',
    'Composteur collectif',
    'AMAP',
    'Jardin partagé',
    'Grainothèque',
    'Friperie',
    'Donnerie',
    'Épicerie sociale',
    'Épicerie vrac',
    "Bibliothèque d'objets",
    'SEL',
    'Accorderie',
    'Fab Lab',
    'Coopérative',
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
      // Call server action
      const result = await createInitiative({
        name,
        type,
        description: description || undefined,
        address: address || undefined,
        latitude,
        longitude,
        website: website || undefined,
        phone: phone || undefined,
        email: email || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Une erreur est survenue');
      }

      // Reset form and notify success
      formRef.current?.reset();
      onSuccess?.();
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ajouter une initiative</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour ajouter une nouvelle initiative ESS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          {error && (
            <div
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">Initiative Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: Ressourcerie de Belleville"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Initiative Type *</Label>
            <select
              id="type"
              name="type"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Décrivez l'initiative..."
            />
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              type="text"
              id="address"
              name="address"
              placeholder="Ex: 12 rue de la Paix, 75002 Paris"
            />
          </div>

          {/* Coordonnées GPS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                type="number"
                id="latitude"
                name="latitude"
                step="0.000001"
                required
                placeholder="Ex: 48.8566"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                type="number"
                id="longitude"
                name="longitude"
                step="0.000001"
                required
                placeholder="Ex: 2.3522"
              />
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Informations de contact</h3>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                type="url"
                id="website"
                name="website"
                placeholder="https://exemple.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="01 23 45 67 89"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="contact@exemple.com"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Ajout en cours...' : "Ajouter l'initiative"}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6"
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

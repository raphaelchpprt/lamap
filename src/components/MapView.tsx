'use client';
import { MapPlus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import AddInitiativeForm from '@/components/AddInitiativeForm';
import FilterPanel from '@/components/FilterPanel';
import Map from '@/components/Map/Map';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { databaseInitiativeToInitiative } from '@/lib/supabase/types';

import type { Initiative, InitiativeType } from '@/types/initiative';

export default function MapView() {
  // State
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>(
    []
  );
  const [selectedTypes, setSelectedTypes] = useState<InitiativeType[]>([]);
  const [selectedInitiative, setSelectedInitiative] =
    useState<Initiative | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initiatives from Supabase
  const loadInitiatives = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        throw new Error(`Supabase error: ${dbError.message}`);
      }

      const formattedInitiatives = (data || []).map(
        databaseInitiativeToInitiative
      );
      setInitiatives(formattedInitiatives);

      // Initialize with all types selected
      const allTypes = Array.from(
        new Set(formattedInitiatives.map((i) => i.type))
      ) as InitiativeType[];
      setSelectedTypes(allTypes);
    } catch (err) {
      console.error('Error loading initiatives:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

  // Filter initiatives based on selected types
  useEffect(() => {
    if (selectedTypes.length === 0) {
      setFilteredInitiatives([]);
    } else {
      setFilteredInitiatives(
        initiatives.filter((i) => selectedTypes.includes(i.type))
      );
    }
  }, [initiatives, selectedTypes]);

  // Count initiatives by type
  const initiativeCounts = initiatives.reduce((acc, initiative) => {
    acc[initiative.type] = (acc[initiative.type] || 0) + 1;
    return acc;
  }, {} as Partial<Record<InitiativeType, number>>);

  // Handlers
  const handleInitiativeClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
  };

  const handleAddSuccess = () => {
    setIsAddFormOpen(false);
    loadInitiatives(); // Reload data
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar - Filter Panel */}
      <aside className="flex w-80 flex-col gap-4 overflow-y-auto border-r bg-background p-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">LaMap</h1>
          <p className="text-sm text-muted-foreground">
            Carte collaborative des initiatives d&apos;Économie Sociale et
            Solidaire
          </p>
        </div>

        {/* Add Initiative Button */}
        <Button onClick={() => setIsAddFormOpen(true)} className="w-full">
          <MapPlus /> Ajouter une initiative
        </Button>

        {/* Stats */}
        {!loading && (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-bold text-primary">
                {initiatives.length}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              initiatives référencées
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {!loading && (
          <FilterPanel
            selectedTypes={selectedTypes}
            onFilterChange={setSelectedTypes}
            initiativeCounts={initiativeCounts}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">Erreur</p>
            <p className="mt-1 text-xs text-destructive/80">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadInitiatives}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        )}
      </aside>

      {/* Main - Map */}
      <main className="relative flex-1">
        <Map
          initiatives={filteredInitiatives}
          onInitiativeClick={handleInitiativeClick}
          enableClustering
          autoFit={false}
        />
      </main>

      {/* Dialog - Add Initiative Form */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle initiative</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour ajouter une initiative
              ESS à la carte
            </DialogDescription>
          </DialogHeader>
          <AddInitiativeForm
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog - Initiative Details */}
      <Dialog
        open={!!selectedInitiative}
        onOpenChange={(open: boolean) => !open && setSelectedInitiative(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedInitiative && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInitiative.name}</DialogTitle>
                <DialogDescription>{selectedInitiative.type}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedInitiative.description && (
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedInitiative.description}
                    </p>
                  </div>
                )}
                {selectedInitiative.address && (
                  <div>
                    <h3 className="font-semibold">Adresse</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedInitiative.address}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">Contact</h3>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    {selectedInitiative.website && (
                      <p>
                        🌐{' '}
                        <a
                          href={selectedInitiative.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {selectedInitiative.website}
                        </a>
                      </p>
                    )}
                    {selectedInitiative.phone && (
                      <p>📞 {selectedInitiative.phone}</p>
                    )}
                    {selectedInitiative.email && (
                      <p>
                        ✉️{' '}
                        <a
                          href={`mailto:${selectedInitiative.email}`}
                          className="text-primary hover:underline"
                        >
                          {selectedInitiative.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

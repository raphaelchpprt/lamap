'use client';
import { MapPlus } from 'lucide-react';
import { useState } from 'react';

import AddInitiativeForm from '@/components/AddInitiativeForm';
import FilterPanel from '@/components/FilterPanel';
import InitiativeCard from '@/components/Initiative/InitiativeCard';
import Map from '@/components/Map/Map';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { Initiative, InitiativeType } from '@/types/initiative';

export default function MapView() {
  // State
  const [selectedTypes, setSelectedTypes] = useState<InitiativeType[]>([]);
  const [selectedInitiative, setSelectedInitiative] =
    useState<Initiative | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Handlers
  const handleInitiativeClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
  };

  const handleAddSuccess = () => {
    setIsAddFormOpen(false);
    // Map will auto-reload via viewport-based loading
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar - Controls */}
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
          <MapPlus strokeWidth={2.5} /> Ajouter une initiative
        </Button>

        {/* Filter Panel */}
        <FilterPanel
          selectedTypes={selectedTypes}
          onFilterChange={setSelectedTypes}
        />
      </aside>

      {/* Main - Map */}
      <main className="relative flex-1">
        <Map
          filters={{
            types: selectedTypes,
            verified_only: false,
          }}
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {selectedInitiative && (
            <>
              {/* Hidden title for screen readers (accessibility) */}
              <DialogTitle className="sr-only">
                {selectedInitiative.name}
              </DialogTitle>
              <InitiativeCard
                initiative={selectedInitiative}
                variant="detailed"
                className="border-none shadow-none rounded-lg"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

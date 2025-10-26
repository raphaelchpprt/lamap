'use client';
import { MapPlus } from 'lucide-react';
import { useState } from 'react';

import AddInitiativeForm from '@/components/AddInitiativeForm';
import FilterPanel from '@/components/FilterPanel';
import InitiativeCard from '@/components/Initiative/InitiativeCard';
import Map from '@/components/Map/Map';
import StatsPanel from '@/components/StatsPanel';
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
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  // Handlers
  const handleInitiativeClick = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
  };

  const handleAddSuccess = () => {
    setIsAddFormOpen(false);
    // Map will auto-reload via viewport-based loading
  };

  const handleInitiativesLoaded = (loadedInitiatives: Initiative[]) => {
    setInitiatives(loadedInitiatives);
  };

  return (
    <div className="flex h-full w-full rounded-tl-[2rem] rounded-bl-[2rem]">
      {/* Modern Glassmorphism Sidebar */}
      <aside className="flex w-96 flex-col gap-6 overflow-y-auto p-6 glass-strong border-r border-white/10 ">
        {/* Header with gradient text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">LaMap</h1>
          <h2 className="text-xl font-semibold text-white/90">
            Engagez-vous près de chez vous !
          </h2>
          <p className="text-sm text-white/70">
            Plateforme collaborative des initiatives sociales, solidaires et
            écologiques
          </p>
        </div>

        {/* Statistics Panel */}
        <StatsPanel
          initiatives={initiatives}
          selectedTypes={selectedTypes}
          detailed
        />

        {/* Add Initiative Button with gradient - taller with extra padding */}
        <Button
          onClick={() => setIsAddFormOpen(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-none shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:scale-105 py-6 text-base"
        >
          <MapPlus strokeWidth={2.5} className="mr-2 h-5 w-5" />
          Ajouter une initiative
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
          onInitiativesLoaded={handleInitiativesLoaded}
          enableClustering
          autoFit={false}
        />
      </main>

      {/* Dialog - Add Initiative Form with glassmorphism */}
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto glass-strong border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Ajouter une nouvelle initiative
            </DialogTitle>
            <DialogDescription className="text-white/70">
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

      {/* Dialog - Initiative Details with glassmorphism */}
      <Dialog
        open={!!selectedInitiative}
        onOpenChange={(open: boolean) => !open && setSelectedInitiative(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 glass-strong border-white/20">
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

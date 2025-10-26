'use client';

import { ChevronDown, Lightbulb, Sparkles } from 'lucide-react';
import { useState } from 'react';

// shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

// 4. Types
import type { InitiativeType } from '@/types/initiative';

interface FilterPanelProps {
  selectedTypes: InitiativeType[];
  onFilterChange: (types: InitiativeType[]) => void;
  initiativeCounts?: Partial<Record<InitiativeType, number>>;
}

const INITIATIVE_TYPES: InitiativeType[] = [
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

// Modern gradient colors for each type
const TYPE_GRADIENTS: Record<InitiativeType, string> = {
  Ressourcerie: 'from-gray-400 to-gray-600',
  'Repair Café': 'from-orange-400 to-red-600',
  AMAP: 'from-green-400 to-emerald-600',
  "Entreprise d'insertion": 'from-blue-400 to-indigo-600',
  'Point de collecte': 'from-purple-400 to-violet-600',
  Recyclerie: 'from-teal-400 to-cyan-600',
  'Épicerie sociale': 'from-red-400 to-pink-600',
  'Jardin partagé': 'from-lime-400 to-green-600',
  'Fab Lab': 'from-violet-400 to-purple-600',
  Coopérative: 'from-cyan-400 to-blue-600',
  'Monnaie locale': 'from-yellow-400 to-orange-600',
  'Tiers-lieu': 'from-fuchsia-400 to-pink-600',
  Autre: 'from-gray-400 to-slate-600',
};

export default function FilterPanel({
  selectedTypes,
  onFilterChange,
  initiativeCounts = {},
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTypeToggle = (type: InitiativeType) => {
    if (selectedTypes.includes(type)) {
      onFilterChange(selectedTypes.filter((t) => t !== type));
    } else {
      onFilterChange([...selectedTypes, type]);
    }
  };

  const handleSelectAll = () => {
    onFilterChange(INITIATIVE_TYPES);
  };

  const handleDeselectAll = () => {
    onFilterChange([]);
  };

  const totalCount = initiativeCounts
    ? Object.values(initiativeCounts).reduce((sum, count) => sum + count, 0)
    : 0;
  const selectedCount = initiativeCounts
    ? selectedTypes.reduce(
        (sum, type) => sum + (initiativeCounts[type] || 0),
        0
      )
    : 0;

  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      {/* Header with gradient */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Filtres</h3>
            {totalCount > 0 && (
              <p className="text-xs text-white/60">
                {selectedCount} / {totalCount} initiatives
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronDown
            className={`h-5 w-5 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </div>

      {/* Quick actions */}
      {isExpanded && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="h-auto p-2 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-white/10"
          >
            Tout sélectionner
          </Button>
          <span className="text-white/30">|</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeselectAll}
            className="h-auto p-2 text-xs text-white/50 hover:text-white/70 hover:bg-white/10"
          >
            Tout désélectionner
          </Button>
        </div>
      )}

      {/* Type list with glassmorphism */}
      {isExpanded && (
        <div className="space-y-2">
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-2">
              {INITIATIVE_TYPES.map((type) => {
                const count = initiativeCounts[type] || 0;
                const isSelected = selectedTypes.includes(type);

                return (
                  <div
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`
                      relative group flex items-center justify-between p-3 rounded-xl
                      cursor-pointer transition-all duration-300
                      ${
                        isSelected
                          ? 'bg-white/20 backdrop-blur-md shadow-lg scale-[1.02]'
                          : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    {/* Gradient border effect */}
                    {isSelected && (
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${TYPE_GRADIENTS[type]} opacity-20 blur-sm`}
                      />
                    )}

                    <div className="relative flex items-center gap-3">
                      <Checkbox
                        id={`filter-${type}`}
                        checked={isSelected}
                        onCheckedChange={() => handleTypeToggle(type)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 border-white/30"
                      />
                      <Label
                        htmlFor={`filter-${type}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${TYPE_GRADIENTS[type]} shadow-lg`}
                        />
                        <span className="text-sm font-medium text-white">
                          {type}
                        </span>
                      </Label>
                    </div>

                    {count > 0 && (
                      <Badge
                        className={`
                          relative z-10
                          ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none'
                              : 'bg-white/10 text-white/80 border-white/20'
                          }
                        `}
                      >
                        {count}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Info tooltip with glassmorphism */}
          {totalCount > 0 && (
            <div className="pt-4 border-t border-white/10 mt-4">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm">
                <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-cyan-300" />
                <p className="text-xs text-white/70">
                  Cliquez sur un type pour afficher/masquer les initiatives
                  correspondantes sur la carte
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

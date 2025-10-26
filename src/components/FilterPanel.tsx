'use client';

import { ChevronDown, Lightbulb } from 'lucide-react';
import { useState } from 'react';

// shadcn/ui components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const TYPE_COLORS: Record<InitiativeType, string> = {
  Ressourcerie: 'bg-gray-500',
  'Repair Café': 'bg-orange-500',
  AMAP: 'bg-green-600',
  "Entreprise d'insertion": 'bg-blue-500',
  'Point de collecte': 'bg-purple-500',
  Recyclerie: 'bg-teal-500',
  'Épicerie sociale': 'bg-red-600',
  'Jardin partagé': 'bg-lime-600',
  'Fab Lab': 'bg-violet-600',
  Coopérative: 'bg-cyan-600',
  'Monnaie locale': 'bg-yellow-600',
  'Tiers-lieu': 'bg-fuchsia-600',
  Autre: 'bg-gray-500',
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filtres</CardTitle>
            {totalCount > 0 && (
              <CardDescription>
                {selectedCount} / {totalCount} initiatives
              </CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Réduire' : 'Développer'}
          >
            {/* 🎨 Icône Lucide avec animation */}
            <ChevronDown
              className={`h-5 w-5 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>

        {/* Actions rapides */}
        {isExpanded && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="link"
              size="sm"
              onClick={handleSelectAll}
              className="h-auto p-0"
            >
              Tout sélectionner
            </Button>
            <span className="text-muted-foreground">|</span>
            <Button
              variant="link"
              size="sm"
              onClick={handleDeselectAll}
              className="h-auto p-0 text-muted-foreground"
            >
              Tout désélectionner
            </Button>
          </div>
        )}
      </CardHeader>

      {/* 📜 Liste des types avec scroll élégant */}
      {isExpanded && (
        <CardContent className="space-y-2">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {INITIATIVE_TYPES.map((type) => {
                const count = initiativeCounts[type] || 0;
                const isSelected = selectedTypes.includes(type);

                return (
                  <div
                    key={type}
                    className={`
                  flex items-center justify-between p-3 rounded-lg
                  transition-colors border-2 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-primary/5 border-primary'
                      : 'bg-muted/50 border-transparent hover:bg-muted'
                  }
                `}
                  >
                    <div className="flex items-center gap-3">
                      {/* 🎨 Checkbox shadcn/ui avec accessibilité Radix UI */}
                      <Checkbox
                        id={`filter-${type}`}
                        checked={isSelected}
                        onCheckedChange={() => handleTypeToggle(type)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor={`filter-${type}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${TYPE_COLORS[type]}`}
                        />
                        <span className="text-sm font-medium">{type}</span>
                      </Label>
                    </div>
                    {count > 0 && (
                      <Badge variant={isSelected ? 'default' : 'secondary'}>
                        {count}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* 💡 Légende avec icône Lucide */}
          {totalCount > 0 && (
            <div className="pt-4 border-t mt-4">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Cliquez sur un type pour afficher/masquer les initiatives
                  correspondantes sur la carte
                </p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

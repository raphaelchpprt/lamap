'use client';

import { useState } from 'react';

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
  Ressourcerie: 'bg-primary-500',
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

  const totalCount = Object.values(initiativeCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const selectedCount = selectedTypes.reduce(
    (sum, type) => sum + (initiativeCounts[type] || 0),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Filtres
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({selectedCount} / {totalCount})
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isExpanded ? 'Réduire' : 'Développer'}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Actions rapides */}
        {isExpanded && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tout sélectionner
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Tout désélectionner
            </button>
          </div>
        )}
      </div>

      {/* Liste des types */}
      {isExpanded && (
        <div className="p-4 space-y-2">
          {INITIATIVE_TYPES.map((type) => {
            const count = initiativeCounts[type] || 0;
            const isSelected = selectedTypes.includes(type);

            return (
              <label
                key={type}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer
                  transition-colors
                  ${
                    isSelected
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${TYPE_COLORS[type]}`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </span>
                  </div>
                </div>
                {count > 0 && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {/* Légende */}
      {isExpanded && totalCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            💡 Cliquez sur un type pour afficher/masquer les initiatives
            correspondantes sur la carte
          </p>
        </div>
      )}
    </div>
  );
}

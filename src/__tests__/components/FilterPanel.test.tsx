import { render, screen, fireEvent } from '@testing-library/react';

import FilterPanel from '@/components/FilterPanel';

import type { InitiativeType } from '@/types/initiative';

describe('FilterPanel', () => {
  const mockOnFilterChange = jest.fn();
  const defaultSelectedTypes: InitiativeType[] = ['Ressourcerie', 'AMAP'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays all initiative types', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Ressourcerie')).toBeInTheDocument();
    expect(screen.getByText('Repair Café')).toBeInTheDocument();
    expect(screen.getByText('AMAP')).toBeInTheDocument();
    expect(screen.getByText('Épicerie sociale')).toBeInTheDocument();
    expect(screen.getByText('Fab Lab')).toBeInTheDocument();
  });

  it('displays selected types as checked', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    const ressourcerieCheckbox = screen.getByRole('checkbox', {
      name: /Ressourcerie/,
    });
    const amapCheckbox = screen.getByRole('checkbox', { name: /AMAP/ });
    const repairCafeCheckbox = screen.getByRole('checkbox', {
      name: /Repair Café/,
    });

    expect(ressourcerieCheckbox).toBeChecked();
    expect(amapCheckbox).toBeChecked();
    expect(repairCafeCheckbox).not.toBeChecked();
  });

  it('calls onFilterChange when selecting a type', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    const repairCafeCheckbox = screen.getByRole('checkbox', {
      name: /Repair Café/,
    });
    fireEvent.click(repairCafeCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith([
      ...defaultSelectedTypes,
      'Repair Café',
    ]);
  });

  it('calls onFilterChange when deselecting a type', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    const ressourcerieCheckbox = screen.getByRole('checkbox', {
      name: /Ressourcerie/,
    });
    fireEvent.click(ressourcerieCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(['AMAP']);
  });

  it('selects all types when clicking "Select all"', () => {
    render(
      <FilterPanel selectedTypes={[]} onFilterChange={mockOnFilterChange} />
    );

    const selectAllButton = screen.getByText('Tout sélectionner');
    fireEvent.click(selectAllButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
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
      ])
    );
  });

  it('deselects all types when clicking "Deselect all"', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    const deselectAllButton = screen.getByText('Tout désélectionner');
    fireEvent.click(deselectAllButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith([]);
  });

  it('displays initiative counters when provided', () => {
    const initiativeCounts = {
      Ressourcerie: 5,
      AMAP: 3,
      'Repair Café': 2,
    };

    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
        initiativeCounts={initiativeCounts}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays total filtered initiatives', () => {
    const initiativeCounts = {
      Ressourcerie: 5,
      AMAP: 3,
      'Repair Café': 2,
    };

    render(
      <FilterPanel
        selectedTypes={['Ressourcerie', 'AMAP']}
        onFilterChange={mockOnFilterChange}
        initiativeCounts={initiativeCounts}
      />
    );

    // 5 (Ressourcerie) + 3 (AMAP) = 8 selected out of 10 total
    expect(screen.getByText(/8 \/ 10/)).toBeInTheDocument();
  });

  it('can be collapsed and expanded', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Initially expanded
    expect(
      screen.getByRole('checkbox', { name: /Ressourcerie/ })
    ).toBeVisible();

    // Click collapse button
    const toggleButton = screen.getByLabelText('Réduire');
    fireEvent.click(toggleButton);

    // Checkboxes are hidden
    expect(
      screen.queryByRole('checkbox', { name: /Ressourcerie/ })
    ).not.toBeInTheDocument();

    // Click again to expand
    const expandButton = screen.getByLabelText('Développer');
    fireEvent.click(expandButton);

    // Checkboxes are visible again
    expect(
      screen.getByRole('checkbox', { name: /Ressourcerie/ })
    ).toBeVisible();
  });

  it('highlights selected type checkboxes', () => {
    render(
      <FilterPanel
        selectedTypes={['Ressourcerie']}
        onFilterChange={mockOnFilterChange}
      />
    );

    // 🎨 Verify Ressourcerie checkbox is checked
    const ressourcerieCheckbox = screen.getByLabelText('Ressourcerie');
    expect(ressourcerieCheckbox).toBeChecked();

    // Verify the parent container has the selected background (bg-white/20)
    const ressourcerieContainer = ressourcerieCheckbox.closest(
      'div[class*="bg-white/20"]'
    );
    expect(ressourcerieContainer).toBeInTheDocument();
  });

  it('displays colored visual indicator for each type', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Verify each type has its color indicator
    const colorIndicators = screen
      .getAllByRole('checkbox')
      .map((checkbox) =>
        checkbox.parentElement?.querySelector('.rounded-full')
      );

    expect(colorIndicators.length).toBeGreaterThan(0);
    colorIndicators.forEach((indicator) => {
      expect(indicator).toBeInTheDocument();
    });
  });

  it('is accessible with appropriate ARIA attributes', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Checkboxes should be accessible
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeEnabled();
    });

    // Buttons should have appropriate labels
    expect(screen.getByLabelText(/Réduire|Développer/)).toBeInTheDocument();
  });
});

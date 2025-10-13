import { render, screen, fireEvent } from '@testing-library/react';

import FilterPanel from '@/components/FilterPanel';

import type { InitiativeType } from '@/types/initiative';

describe('FilterPanel', () => {
  const mockOnFilterChange = jest.fn();
  const defaultSelectedTypes: InitiativeType[] = ['Ressourcerie', 'AMAP'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche tous les types d'initiatives", () => {
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

  it('affiche les types sélectionnés comme cochés', () => {
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

  it("appelle onFilterChange lors de la sélection d'un type", () => {
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

  it("appelle onFilterChange lors de la désélection d'un type", () => {
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

  it('sélectionne tous les types lors du clic sur "Tout sélectionner"', () => {
    render(
      <FilterPanel selectedTypes={[]} onFilterChange={mockOnFilterChange} />
    );

    const selectAllButton = screen.getByText('Tout sélectionner');
    fireEvent.click(selectAllButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
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
      ])
    );
  });

  it('désélectionne tous les types lors du clic sur "Tout désélectionner"', () => {
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

  it("affiche les compteurs d'initiatives si fournis", () => {
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

  it('affiche le total des initiatives filtrées', () => {
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

    // 5 (Ressourcerie) + 3 (AMAP) = 8 sélectionnés sur 10 total
    expect(screen.getByText(/8 \/ 10/)).toBeInTheDocument();
  });

  it('peut être réduit et développé', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Initialement développé
    expect(
      screen.getByRole('checkbox', { name: /Ressourcerie/ })
    ).toBeVisible();

    // Cliquer sur le bouton de réduction
    const toggleButton = screen.getByLabelText('Réduire');
    fireEvent.click(toggleButton);

    // Les checkboxes sont masquées
    expect(
      screen.queryByRole('checkbox', { name: /Ressourcerie/ })
    ).not.toBeInTheDocument();

    // Cliquer à nouveau pour développer
    const expandButton = screen.getByLabelText('Développer');
    fireEvent.click(expandButton);

    // Les checkboxes sont à nouveau visibles
    expect(
      screen.getByRole('checkbox', { name: /Ressourcerie/ })
    ).toBeVisible();
  });

  it('applique des styles visuels différents aux types sélectionnés', () => {
    const { container } = render(
      <FilterPanel
        selectedTypes={['Ressourcerie']}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Trouver le label de Ressourcerie et vérifier qu'il a une classe de sélection
    const labels = container.querySelectorAll('label');
    const ressourcerieLabel = Array.from(labels).find((label) =>
      label.textContent?.includes('Ressourcerie')
    );

    expect(ressourcerieLabel).toHaveClass('bg-primary-50');
  });

  it('affiche un indicateur visuel coloré pour chaque type', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Vérifier que chaque type a son indicateur de couleur
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

  it('est accessible avec les attributs ARIA appropriés', () => {
    render(
      <FilterPanel
        selectedTypes={defaultSelectedTypes}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Les checkboxes doivent être accessibles
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeEnabled();
    });

    // Les boutons doivent avoir des labels appropriés
    expect(screen.getByLabelText(/Réduire|Développer/)).toBeInTheDocument();
  });
});

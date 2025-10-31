import { render, screen, fireEvent } from '@testing-library/react';

import InitiativeCard from '@/components/Initiative/InitiativeCard';

import type { Initiative } from '@/types/initiative';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    },
  })),
}));

const mockInitiative: Initiative = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Ressourcerie de Belleville',
  type: 'Ressourcerie',
  description: 'Une ressourcerie engagée pour le réemploi',
  address: '12 rue de Belleville, 75020 Paris',
  location: {
    type: 'Point',
    coordinates: [2.3894, 48.8724],
  },
  verified: true,
  image_url: 'https://example.com/image.jpg',
  website: 'https://ressourcerie-belleville.fr',
  phone: '01 23 45 67 89',
  email: 'contact@ressourcerie-belleville.fr',
  opening_hours: {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: null,
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '17:00' },
    sunday: null,
  },
  user_id: 'user-123',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

describe('InitiativeCard', () => {
  it('displays basic initiative information', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    expect(screen.getByText('Ressourcerie de Belleville')).toBeInTheDocument();
    expect(screen.getByText('Ressourcerie')).toBeInTheDocument();
    expect(screen.getByText(/Une ressourcerie engagée/)).toBeInTheDocument();
  });

  it('displays address when present', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    expect(screen.getByText(/12 rue de Belleville/)).toBeInTheDocument();
  });

  it('displays "Verified" badge for verified initiatives', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    // The badge shows "Vérifiée" (feminine form for "initiative")
    expect(screen.getByText('Vérifiée')).toBeInTheDocument();
  });

  it('does not display "Verified" badge for unverified initiatives', () => {
    const unverifiedInitiative = { ...mockInitiative, verified: false };
    render(<InitiativeCard initiative={unverifiedInitiative} />);

    expect(screen.queryByText('Vérifiée')).not.toBeInTheDocument();
  });

  it('displays contact links when present', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    const websiteLink = screen.getByRole('link', { name: /site web/i });
    expect(websiteLink).toHaveAttribute(
      'href',
      'https://ressourcerie-belleville.fr'
    );
    expect(websiteLink).toHaveAttribute('target', '_blank');
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays phone and email as accessible links', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    // Phone and email are displayed as links with text content
    const phoneLink = screen.getByRole('link', { name: /01 23 45 67 89/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:01 23 45 67 89');

    const emailLink = screen.getByRole('link', {
      name: /contact@ressourcerie-belleville\.fr/i,
    });
    expect(emailLink).toHaveAttribute(
      'href',
      'mailto:contact@ressourcerie-belleville.fr'
    );
  });

  it('handles card click to display more details', () => {
    const onClickMock = jest.fn();
    render(
      <InitiativeCard initiative={mockInitiative} onClick={onClickMock} />
    );

    // Card with onClick becomes a button role for accessibility
    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onClickMock).toHaveBeenCalledTimes(1);
    expect(onClickMock).toHaveBeenCalledWith(mockInitiative);
  });

  it('displays image when present', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    const image = screen.getByAltText('Ressourcerie de Belleville');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  it('handles missing optional information', () => {
    const minimalInitiative: Initiative = {
      id: '123',
      name: 'Initiative minimale',
      type: 'Autre',
      location: {
        type: 'Point',
        coordinates: [2.3522, 48.8566],
      },
      verified: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    };

    render(<InitiativeCard initiative={minimalInitiative} />);

    expect(screen.getByText('Initiative minimale')).toBeInTheDocument();
    expect(screen.getByText('Autre')).toBeInTheDocument();
    expect(screen.queryByText(/http/)).not.toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    const { container } = render(
      <InitiativeCard initiative={mockInitiative} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('displays opening hours when detailed variant is used', () => {
    // Opening hours are shown in detailed variant (e.g., in popup/modal)
    render(<InitiativeCard initiative={mockInitiative} variant="detailed" />);

    // Detailed variant shows opening hours section
    expect(screen.getByText(/Horaires/i)).toBeInTheDocument();
    // Opening hours are formatted in abbreviated form
    expect(screen.getByText(/Lun:/i)).toBeInTheDocument();
    expect(screen.getByText(/09:00-18:00/)).toBeInTheDocument();
  });

  it('is accessible with appropriate semantic structure', () => {
    render(<InitiativeCard initiative={mockInitiative} />);

    // Without onClick, card is a simple div container
    // With onClick, it becomes a button with proper accessibility
    const heading = screen.getByRole('heading', {
      name: 'Ressourcerie de Belleville',
    });
    expect(heading).toBeInTheDocument();

    // Image has proper alt text
    const image = screen.getByAltText('Ressourcerie de Belleville');
    expect(image).toBeInTheDocument();
  });
});

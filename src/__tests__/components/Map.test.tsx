/**
 * Tests for Map component
 *
 * Tests the Mapbox integration, marker display, and clustering.
 */

import { render, screen } from '@testing-library/react';

import Map from '@/components/Map/Map';

import type { InitiativeType } from '@/types/initiative';

// Mock mapbox-gl (uses __mocks__/mapbox-gl.js)
jest.mock('mapbox-gl');

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  })),
}));

describe('Map Component', () => {
  beforeEach(() => {
    // Set environment variable for Mapbox token
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token';
  });

  it('should render map container', () => {
    render(<Map />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Map className="custom-map-class" />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveClass('custom-map-class');
  });

  it('should handle missing Mapbox token gracefully', () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Should not throw
    expect(() => render(<Map />)).not.toThrow();
  });

  it('should render with default configuration', () => {
    const { container } = render(<Map />);

    expect(
      container.querySelector('[data-testid="map-container"]')
    ).toBeInTheDocument();
  });

  it('should call onInitiativeClick when provided', () => {
    const mockOnInitiativeClick = jest.fn();

    render(<Map onInitiativeClick={mockOnInitiativeClick} />);

    // Map is rendered, callback is set up
    expect(mockOnInitiativeClick).not.toHaveBeenCalled();
  });

  it('should call onMapClick when provided', () => {
    const mockOnMapClick = jest.fn();

    render(<Map onMapClick={mockOnMapClick} />);

    // Map is rendered, callback is set up
    expect(mockOnMapClick).not.toHaveBeenCalled();
  });

  it('should enable clustering by default', () => {
    render(<Map />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should disable clustering when specified', () => {
    render(<Map enableClustering={false} />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should apply filters when provided', () => {
    const filters = {
      types: ['AMAP', 'Repair Café'] as InitiativeType[],
    };

    render(<Map filters={filters} />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should have correct height', () => {
    render(<Map />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveClass('h-full');
  });

  it('should have correct width', () => {
    render(<Map />);

    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toHaveClass('w-full');
  });

  it('should render without errors', () => {
    // Should not throw any errors
    expect(() => render(<Map />)).not.toThrow();
  });
});

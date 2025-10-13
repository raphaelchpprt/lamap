/**
 * Tests for AddInitiativeForm component
 *
 * Tests the form validation, submission, and error handling.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createInitiative } from '@/app/actions';
import AddInitiativeForm from '@/components/AddInitiativeForm';

// Mock the server action
jest.mock('@/app/actions', () => ({
  createInitiative: jest.fn(),
}));

const mockCreateInitiative = createInitiative as jest.MockedFunction<
  typeof createInitiative
>;

describe('AddInitiativeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<AddInitiativeForm />);

    expect(screen.getByLabelText(/Initiative Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initiative Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Site web/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('should display submit button', () => {
    render(<AddInitiativeForm />);

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('should display cancel button when onCancel is provided', () => {
    const mockCancel = jest.fn();
    render(<AddInitiativeForm onCancel={mockCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('should not display cancel button when onCancel is not provided', () => {
    render(<AddInitiativeForm />);

    const cancelButton = screen.queryByRole('button', { name: /Annuler/i });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();
    render(<AddInitiativeForm onCancel={mockCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    await user.click(cancelButton);

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('should show validation error for missing required fields', async () => {
    render(<AddInitiativeForm />);

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Veuillez remplir tous les champs obligatoires/i)
      ).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockSuccess = jest.fn();

    mockCreateInitiative.mockResolvedValue({
      success: true,
      data: { id: 'initiative123' },
    });

    render(<AddInitiativeForm onSuccess={mockSuccess} />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/Initiative Name/i), 'Test AMAP');

    const typeSelect = screen.getByLabelText(/Initiative Type/i);
    await user.selectOptions(typeSelect, 'AMAP');

    await user.type(screen.getByLabelText(/Latitude/i), '48.8566');
    await user.type(screen.getByLabelText(/Longitude/i), '2.3522');

    // Submit form
    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInitiative).toHaveBeenCalledWith({
        name: 'Test AMAP',
        type: 'AMAP',
        latitude: 48.8566,
        longitude: 2.3522,
      });
      expect(mockSuccess).toHaveBeenCalled();
    });
  });

  it('should submit form with all fields filled', async () => {
    const user = userEvent.setup();

    mockCreateInitiative.mockResolvedValue({
      success: true,
      data: { id: 'initiative123' },
    });

    render(<AddInitiativeForm />);

    // Fill in all fields
    await user.type(screen.getByLabelText(/Initiative Name/i), 'Test AMAP');

    const typeSelect = screen.getByLabelText(/Initiative Type/i);
    await user.selectOptions(typeSelect, 'AMAP');

    await user.type(
      screen.getByLabelText(/Description/i),
      'A great initiative'
    );
    await user.type(
      screen.getByLabelText(/Adresse/i),
      '123 Test Street, Paris'
    );
    await user.type(screen.getByLabelText(/Latitude/i), '48.8566');
    await user.type(screen.getByLabelText(/Longitude/i), '2.3522');
    await user.type(screen.getByLabelText(/Site web/i), 'https://test.com');
    await user.type(screen.getByLabelText(/Téléphone/i), '0123456789');
    await user.type(screen.getByLabelText(/Email/i), 'test@test.com');

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateInitiative).toHaveBeenCalledWith({
        name: 'Test AMAP',
        type: 'AMAP',
        description: 'A great initiative',
        address: '123 Test Street, Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        website: 'https://test.com',
        phone: '0123456789',
        email: 'test@test.com',
      });
    });
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();

    mockCreateInitiative.mockResolvedValue({
      success: false,
      error: 'Vous devez être connecté',
    });

    render(<AddInitiativeForm />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/Initiative Name/i), 'Test AMAP');
    const typeSelect = screen.getByLabelText(/Initiative Type/i);
    await user.selectOptions(typeSelect, 'AMAP');
    await user.type(screen.getByLabelText(/Latitude/i), '48.8566');
    await user.type(screen.getByLabelText(/Longitude/i), '2.3522');

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Vous devez être connecté/i)
      ).toBeInTheDocument();
    });
  });

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup();

    // Make the mock take some time to resolve
    mockCreateInitiative.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, data: { id: 'test' } }),
            100
          )
        )
    );

    render(<AddInitiativeForm />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/Initiative Name/i), 'Test');
    const typeSelect = screen.getByLabelText(/Initiative Type/i);
    await user.selectOptions(typeSelect, 'AMAP');
    await user.type(screen.getByLabelText(/Latitude/i), '48.8566');
    await user.type(screen.getByLabelText(/Longitude/i), '2.3522');

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });

    await user.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Ajout en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();

    mockCreateInitiative.mockResolvedValue({
      success: true,
      data: { id: 'initiative123' },
    });

    render(<AddInitiativeForm />);

    const nameInput = screen.getByLabelText(
      /Initiative Name/i
    ) as HTMLInputElement;
    await user.type(nameInput, 'Test AMAP');

    const typeSelect = screen.getByLabelText(/Initiative Type/i);
    await user.selectOptions(typeSelect, 'AMAP');

    await user.type(screen.getByLabelText(/Latitude/i), '48.8566');
    await user.type(screen.getByLabelText(/Longitude/i), '2.3522');

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe('');
    });
  });

  it('should render all initiative types in the select', () => {
    render(<AddInitiativeForm />);

    const typeSelect = screen.getByLabelText(/Initiative Type/i);
    const options = Array.from(typeSelect.querySelectorAll('option')).map(
      (option) => option.textContent
    );

    expect(options).toContain('Ressourcerie');
    expect(options).toContain('Repair Café');
    expect(options).toContain('AMAP');
    expect(options).toContain("Entreprise d'insertion");
    expect(options).toContain('Point de collecte');
    expect(options).toContain('Recyclerie');
    expect(options).toContain('Épicerie sociale');
    expect(options).toContain('Jardin partagé');
    expect(options).toContain('Fab Lab');
    expect(options).toContain('Coopérative');
    expect(options).toContain('Monnaie locale');
    expect(options).toContain('Tiers-lieu');
    expect(options).toContain('Autre');
  });

  it('should handle invalid number inputs gracefully', async () => {
    render(<AddInitiativeForm />);

    const submitButton = screen.getByRole('button', {
      name: /Ajouter l'initiative/i,
    });

    // Don't fill lat/lng (invalid numbers)
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Veuillez remplir tous les champs obligatoires/i)
      ).toBeInTheDocument();
    });

    expect(mockCreateInitiative).not.toHaveBeenCalled();
  });
});
